/**
 * Telemetry Parser
 * Decodes raw incoming byte buffers, DataViews, or strings into parsed JSON objects.
 * Records diagnostic errors for malformed or out-of-order packets.
 */

import type { NormalizedTelemetry, TelemetrySource } from './types';
import { validateTelemetryPayload } from './telemetryValidator';
import { TELEMETRY_CONFIG } from './types';

export interface ParseResult {
  success: boolean;
  telemetry?: NormalizedTelemetry;
  error?: string;
  rawSnippet?: string;
  isSequenceGap?: boolean;
}

export class TelemetryParser {
  private lastSequenceNumber: number | null = null;
  private decoder = new TextDecoder('utf-8');

  /**
   * Parse incoming raw payload from any transport (BLE GATT DataView, Uint8Array, or string)
   */
  parse(
    rawInput: DataView | ArrayBuffer | Uint8Array | string,
    source: TelemetrySource = 'BLE'
  ): ParseResult {
    const receivedAt = new Date().toISOString();
    let text = '';

    try {
      if (typeof rawInput === 'string') {
        text = rawInput.trim();
      } else if (rawInput instanceof DataView) {
        text = this.decoder.decode(rawInput).trim();
      } else if (rawInput instanceof ArrayBuffer) {
        text = this.decoder.decode(new Uint8Array(rawInput)).trim();
      } else if (rawInput instanceof Uint8Array) {
        text = this.decoder.decode(rawInput).trim();
      } else {
        return {
          success: false,
          error: 'Unsupported payload input type (expected string, DataView, ArrayBuffer, or Uint8Array)',
          rawSnippet: String(rawInput).slice(0, 80)
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `TextDecoder decoding failure: ${msg}`,
        rawSnippet: '[Binary Decode Error]'
      };
    }

    if (!text || text.length === 0) {
      return {
        success: false,
        error: 'Empty telemetry packet received (0 bytes)',
        rawSnippet: ''
      };
    }

    // Attempt JSON parse
    let parsedObj: Record<string, unknown>;
    try {
      parsedObj = JSON.parse(text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Malformed JSON: ${msg}`,
        rawSnippet: text.slice(0, 100)
      };
    }

    if (!parsedObj || typeof parsedObj !== 'object') {
      return {
        success: false,
        error: 'Invalid JSON root: expected object',
        rawSnippet: text.slice(0, 100)
      };
    }

    // Sequence Number tracking & gap detection
    let isSequenceGap = false;
    if (typeof parsedObj.sequence_number === 'number') {
      const seq = Math.floor(parsedObj.sequence_number);
      if (this.lastSequenceNumber !== null && seq > this.lastSequenceNumber + 1) {
        isSequenceGap = true;
      }
      this.lastSequenceNumber = seq;
    }

    // Schema Validation
    const validation = validateTelemetryPayload(parsedObj);
    if (!validation.isValid || !validation.cleanData) {
      return {
        success: false,
        error: `Telemetry validation rejected packet: ${validation.errors.join('; ')}`,
        rawSnippet: text.slice(0, 100)
      };
    }

    const { cleanData, quality } = validation;

    // Node ID mapping (MineGuard_Node_01 maps to N01)
    let nodeId = typeof parsedObj.node_id === 'string' ? parsedObj.node_id : TELEMETRY_CONFIG.BLE_FIRMWARE.MAPPED_NODE_ID;
    if (nodeId === TELEMETRY_CONFIG.BLE_FIRMWARE.DEVICE_NAME || nodeId === 'MineGuard_01') {
      nodeId = TELEMETRY_CONFIG.BLE_FIRMWARE.MAPPED_NODE_ID;
    }

    const timestamp = typeof parsedObj.timestamp === 'string' ? parsedObj.timestamp : receivedAt;

    // Construct Normalized Telemetry
    const normalized: NormalizedTelemetry = {
      schema_version: typeof parsedObj.schema_version === 'string' ? parsedObj.schema_version : 'stratum.telemetry.v1',
      source,
      quality,
      node_id: nodeId,
      timestamp,
      received_at: receivedAt,
      tilt: cleanData.tilt,
      displacement: cleanData.displacement,
      vibration: cleanData.vibration,
      crack_signal: cleanData.crack_signal,
      temperature: cleanData.temperature,
      battery: cleanData.battery,
      rssi: cleanData.rssi,
      packet_loss: cleanData.packet_loss,
      route_through: cleanData.route_through || 'LOCAL',
      sequence_number: cleanData.sequence_number,
      gateway_id: typeof parsedObj.gateway_id === 'string' ? parsedObj.gateway_id : undefined,
      packet_age_ms: 0,
      transport_latency_ms: Math.max(0, Date.now() - new Date(timestamp).getTime()),
      raw_payload: text
    };

    return {
      success: true,
      telemetry: normalized,
      isSequenceGap
    };
  }

  resetSequence(): void {
    this.lastSequenceNumber = null;
  }
}
