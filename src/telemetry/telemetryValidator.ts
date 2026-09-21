/**
 * Telemetry Validator
 * Validates raw payload fields, bounds, and physical constraints without fabricating fake values.
 */

import type { TelemetryQuality } from './types';

export interface ValidationResult {
  isValid: boolean;
  quality: TelemetryQuality;
  errors: string[];
  cleanData?: {
    tilt: number;
    displacement: number;
    vibration: number;
    crack_signal: boolean;
    temperature?: number;
    battery?: number;
    rssi?: number;
    packet_loss?: number;
    route_through?: string;
    sequence_number?: number;
  };
}

export function validateTelemetryPayload(raw: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];

  // 1. Tilt validation (degrees: -90° to 90°)
  let cleanTilt: number | undefined;
  if (raw.tilt === undefined || raw.tilt === null) {
    errors.push('Missing required kinematic field: tilt');
  } else {
    const t = Number(raw.tilt);
    if (!Number.isFinite(t)) {
      errors.push(`Invalid tilt: non-finite value (${String(raw.tilt)})`);
    } else if (t < -90 || t > 90) {
      errors.push(`Tilt value out of physical bounds (-90° to 90°): ${t}`);
    } else {
      cleanTilt = Number(t.toFixed(3));
    }
  }

  // 2. Displacement validation (mm: -100mm to 1000mm)
  let cleanDisp: number | undefined;
  if (raw.displacement === undefined || raw.displacement === null) {
    errors.push('Missing required kinematic field: displacement');
  } else {
    const d = Number(raw.displacement);
    if (!Number.isFinite(d)) {
      errors.push(`Invalid displacement: non-finite value (${String(raw.displacement)})`);
    } else if (d < -100 || d > 1000) {
      errors.push(`Displacement value out of physical bounds (-100 to 1000mm): ${d}`);
    } else {
      cleanDisp = Number(d.toFixed(3));
    }
  }

  // 3. Vibration validation (g: 0g to 50g)
  let cleanVib: number | undefined;
  if (raw.vibration === undefined || raw.vibration === null) {
    errors.push('Missing required kinematic field: vibration');
  } else {
    const v = Number(raw.vibration);
    if (!Number.isFinite(v)) {
      errors.push(`Invalid vibration: non-finite value (${String(raw.vibration)})`);
    } else if (v < 0 || v > 50) {
      errors.push(`Vibration value out of physical bounds (0 to 50g): ${v}`);
    } else {
      cleanVib = Number(v.toFixed(3));
    }
  }

  // 4. Crack signal validation (boolean or 0/1)
  let cleanCrack: boolean | undefined;
  if (raw.crack_signal === undefined || raw.crack_signal === null) {
    errors.push('Missing required field: crack_signal');
  } else if (typeof raw.crack_signal === 'boolean') {
    cleanCrack = raw.crack_signal;
  } else if (raw.crack_signal === 0 || raw.crack_signal === 1) {
    cleanCrack = raw.crack_signal === 1;
  } else if (raw.crack_signal === '0' || raw.crack_signal === '1') {
    cleanCrack = raw.crack_signal === '1';
  } else {
    errors.push(`Invalid crack_signal value: ${String(raw.crack_signal)}`);
  }

  // Optional fields validation
  let cleanTemp: number | undefined;
  if (raw.temperature !== undefined && raw.temperature !== null) {
    const temp = Number(raw.temperature);
    if (Number.isFinite(temp) && temp >= -40 && temp <= 100) {
      cleanTemp = Number(temp.toFixed(1));
    } else {
      errors.push(`Temperature out of physical range (-40°C to 100°C): ${String(raw.temperature)}`);
    }
  }

  let cleanBattery: number | undefined;
  if (raw.battery !== undefined && raw.battery !== null) {
    const b = Number(raw.battery);
    if (Number.isFinite(b) && b >= 0 && b <= 100) {
      cleanBattery = Math.round(b);
    } else {
      errors.push(`Battery percentage out of range (0-100%): ${String(raw.battery)}`);
    }
  }

  let cleanRssi: number | undefined;
  if (raw.rssi !== undefined && raw.rssi !== null) {
    const r = Number(raw.rssi);
    if (Number.isFinite(r) && r >= -140 && r <= 0) {
      cleanRssi = Math.round(r);
    } else {
      errors.push(`RSSI out of range (-140 to 0 dBm): ${String(raw.rssi)}`);
    }
  }

  let cleanPacketLoss: number | undefined;
  if (raw.packet_loss !== undefined && raw.packet_loss !== null) {
    const pl = Number(raw.packet_loss);
    if (Number.isFinite(pl) && pl >= 0 && pl <= 100) {
      cleanPacketLoss = Number(pl.toFixed(1));
    }
  }

  let cleanSeq: number | undefined;
  if (raw.sequence_number !== undefined && raw.sequence_number !== null) {
    const s = Number(raw.sequence_number);
    if (Number.isFinite(s) && s >= 0) {
      cleanSeq = Math.floor(s);
    }
  }

  const cleanRoute = typeof raw.route_through === 'string' ? raw.route_through : undefined;

  // Determine overall quality
  const hasCoreKinematics = cleanTilt !== undefined && cleanDisp !== undefined && cleanVib !== undefined && cleanCrack !== undefined;

  if (hasCoreKinematics && errors.length === 0) {
    return {
      isValid: true,
      quality: 'LIVE',
      errors: [],
      cleanData: {
        tilt: cleanTilt!,
        displacement: cleanDisp!,
        vibration: cleanVib!,
        crack_signal: cleanCrack!,
        temperature: cleanTemp,
        battery: cleanBattery,
        rssi: cleanRssi,
        packet_loss: cleanPacketLoss,
        route_through: cleanRoute,
        sequence_number: cleanSeq
      }
    };
  }

  if (hasCoreKinematics) {
    // Valid core kinematics, but secondary field validation errors
    return {
      isValid: true,
      quality: 'PARTIAL',
      errors,
      cleanData: {
        tilt: cleanTilt!,
        displacement: cleanDisp!,
        vibration: cleanVib!,
        crack_signal: cleanCrack!,
        temperature: cleanTemp,
        battery: cleanBattery,
        rssi: cleanRssi,
        packet_loss: cleanPacketLoss,
        route_through: cleanRoute,
        sequence_number: cleanSeq
      }
    };
  }

  return {
    isValid: false,
    quality: 'INVALID',
    errors
  };
}
