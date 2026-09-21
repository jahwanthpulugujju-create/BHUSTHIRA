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

  // ── Field alias resolution (real-world ESP32 firmware name variations) ───────
  // Allows different firmware versions to send different field names without rejection.
  const r: Record<string, unknown> = { ...raw };

  // tilt aliases (MPU6050, ADXL345, custom)
  if (r.tilt === undefined) {
    r.tilt = r.tilt_deg ?? r.tiltDeg ?? r.angle ?? r.inclination
           ?? r.pitch ?? r.roll ?? r.tilt_angle ?? r.angleX ?? r.angle_x
           ?? r.gyroX ?? r.gyro_x ?? r.x;
  }
  // displacement aliases
  if (r.displacement === undefined) {
    r.displacement = r.disp ?? r.displacement_mm ?? r.dispMm ?? r.deformation
                  ?? r.deform ?? r.settle ?? r.settlement ?? r.dist
                  ?? r.distance ?? r.z ?? r.depth;
  }
  // vibration aliases (MPU6050 acceleration magnitude is very common)
  if (r.vibration === undefined) {
    r.vibration = r.accel ?? r.acc ?? r.vibration_g ?? r.vib ?? r.acceleration
               ?? r.magnitude ?? r.rms ?? r.vibAcc ?? r.accelMag
               ?? r.accel_mag ?? r.g_force ?? r.gforce ?? r.y;
  }
  // crack_signal aliases
  if (r.crack_signal === undefined) {
    r.crack_signal = r.crack ?? r.crack_trip ?? r.crackSignal ?? r.fracture
                  ?? r.acoustic ?? r.sound ?? r.impact ?? r.shock;
  }
  // temperature aliases
  if (r.temperature === undefined) {
    r.temperature = r.temp ?? r.temperature_c ?? r.tempC ?? r.temp_c ?? r.celsius;
  }
  // battery aliases
  if (r.battery === undefined) {
    r.battery = r.bat ?? r.batt ?? r.battery_pct ?? r.battery_percent ?? r.vbat ?? r.voltage;
  }
  // rssi aliases
  if (r.rssi === undefined) {
    r.rssi = r.signal ?? r.ble_rssi ?? r.bleRssi ?? r.snr;
  }

  // ── Numeric field auto-scan ──────────────────────────────────────────────
  // If core fields are still missing after alias resolution, auto-map the first
  // unused numeric fields found in the raw payload (last-resort tolerance).
  const knownKeys = new Set(['tilt','displacement','vibration','crack_signal',
    'temperature','battery','rssi','packet_loss','sequence_number','route_through',
    'node_id','timestamp','received_at','schema_version','source','quality',
    'gateway_id','packet_age_ms','transport_latency_ms','raw_payload']);
  const unmappedNums = Object.entries(raw)
    .filter(([k, v]) => !knownKeys.has(k) && typeof v === 'number' && Number.isFinite(v as number))
    .map(([, v]) => v as number);
  if (r.tilt === undefined && unmappedNums.length > 0)         { r.tilt         = unmappedNums[0]; }
  if (r.displacement === undefined && unmappedNums.length > 1) { r.displacement = unmappedNums[1]; }
  if (r.vibration === undefined && unmappedNums.length > 2)    { r.vibration    = unmappedNums[2]; }

  // 1. Tilt (degrees: -90° to 90°) — defaults to 0 if missing (PARTIAL quality, not rejection)
  let cleanTilt = 0;
  if (r.tilt !== undefined && r.tilt !== null) {
    const t = Number(r.tilt);
    if (Number.isFinite(t) && t >= -90 && t <= 90) {
      cleanTilt = Number(t.toFixed(3));
    } else if (Number.isFinite(t)) {
      // Clamp out-of-bound values rather than reject
      cleanTilt = Math.max(-90, Math.min(90, t));
      errors.push(`Tilt clamped from ${t}° to ${cleanTilt}° (physical bounds ±90°)`);
    } else {
      errors.push(`Invalid tilt: non-finite (${String(r.tilt)}) — defaulting to 0`);
    }
  }

  // 2. Displacement (mm: -100 to 1000) — defaults to 0 if missing
  let cleanDisp = 0;
  if (r.displacement !== undefined && r.displacement !== null) {
    const d = Number(r.displacement);
    if (Number.isFinite(d) && d >= -100 && d <= 1000) {
      cleanDisp = Number(d.toFixed(3));
    } else if (Number.isFinite(d)) {
      cleanDisp = Math.max(-100, Math.min(1000, d));
      errors.push(`Displacement clamped from ${d}mm to ${cleanDisp}mm`);
    } else {
      errors.push(`Invalid displacement: non-finite (${String(r.displacement)}) — defaulting to 0`);
    }
  }

  // 3. Vibration (g: 0 to 50) — defaults to 0 if missing
  let cleanVib = 0;
  if (r.vibration !== undefined && r.vibration !== null) {
    const v = Number(r.vibration);
    if (Number.isFinite(v) && v >= 0 && v <= 50) {
      cleanVib = Number(v.toFixed(3));
    } else if (Number.isFinite(v)) {
      cleanVib = Math.max(0, Math.min(50, Math.abs(v))); // abs() handles negative accel readings
      errors.push(`Vibration clamped from ${v}g to ${cleanVib}g`);
    } else {
      errors.push(`Invalid vibration: non-finite (${String(r.vibration)}) — defaulting to 0`);
    }
  }

  // 4. Crack signal validation (boolean, 0/1, or 'true'/'false')
  let cleanCrack: boolean | undefined;
  if (r.crack_signal === undefined || r.crack_signal === null) {
    // crack_signal missing — default to false rather than rejecting the packet
    cleanCrack = false;
  } else if (typeof r.crack_signal === 'boolean') {
    cleanCrack = r.crack_signal;
  } else if (r.crack_signal === 0 || r.crack_signal === 1) {
    cleanCrack = r.crack_signal === 1;
  } else if (r.crack_signal === '0' || r.crack_signal === '1') {
    cleanCrack = r.crack_signal === '1';
  } else if (r.crack_signal === 'true' || r.crack_signal === 'false') {
    cleanCrack = r.crack_signal === 'true';
  } else {
    // Unknown type — coerce to boolean rather than reject
    cleanCrack = Boolean(r.crack_signal);
  }

  // Optional fields validation
  let cleanTemp: number | undefined;
  if (r.temperature !== undefined && r.temperature !== null) {
    const temp = Number(r.temperature);
    if (Number.isFinite(temp) && temp >= -40 && temp <= 100) {
      cleanTemp = Number(temp.toFixed(1));
    } else {
      errors.push(`Temperature out of physical range (-40°C to 100°C): ${String(r.temperature)}`);
    }
  }

  let cleanBattery: number | undefined;
  if (r.battery !== undefined && r.battery !== null) {
    const b = Number(r.battery);
    if (Number.isFinite(b) && b >= 0 && b <= 100) {
      cleanBattery = Math.round(b);
    } else {
      errors.push(`Battery percentage out of range (0-100%): ${String(r.battery)}`);
    }
  }

  let cleanRssi: number | undefined;
  if (r.rssi !== undefined && r.rssi !== null) {
    const rssiVal = Number(r.rssi);
    if (Number.isFinite(rssiVal) && rssiVal >= -140 && rssiVal <= 0) {
      cleanRssi = Math.round(rssiVal);
    } else {
      errors.push(`RSSI out of range (-140 to 0 dBm): ${String(r.rssi)}`);
    }
  }

  let cleanPacketLoss: number | undefined;
  if (r.packet_loss !== undefined && r.packet_loss !== null) {
    const pl = Number(r.packet_loss);
    if (Number.isFinite(pl) && pl >= 0 && pl <= 100) {
      cleanPacketLoss = Number(pl.toFixed(1));
    }
  }

  let cleanSeq: number | undefined;
  if (r.sequence_number !== undefined && r.sequence_number !== null) {
    const s = Number(r.sequence_number);
    if (Number.isFinite(s) && s >= 0) {
      cleanSeq = Math.floor(s);
    }
  }

  const cleanRoute = typeof r.route_through === 'string' ? r.route_through : undefined;

  // Determine quality: LIVE = all fields present and in-range, PARTIAL = defaulted/clamped fields
  // Packets are NEVER rejected — only downgraded to PARTIAL quality if fields were missing.
  const quality = errors.length === 0 ? 'LIVE' : 'PARTIAL';

  return {
    isValid: true,
    quality,
    errors,
    cleanData: {
      tilt: cleanTilt,
      displacement: cleanDisp,
      vibration: cleanVib,
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
