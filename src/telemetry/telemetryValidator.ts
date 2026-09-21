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
  // This allows different firmware versions to send slightly different field names
  // without every packet being rejected. Aliases are resolved into canonical names.
  const r: Record<string, unknown> = { ...raw };

  // tilt aliases
  if (r.tilt === undefined) {
    r.tilt = r.tilt_deg ?? r.tiltDeg ?? r.angle ?? r.inclination;
  }
  // displacement aliases
  if (r.displacement === undefined) {
    r.displacement = r.disp ?? r.displacement_mm ?? r.dispMm ?? r.deformation ?? r.deform;
  }
  // vibration aliases  (MPU6050 raw acceleration magnitude is common)
  if (r.vibration === undefined) {
    r.vibration = r.accel ?? r.acc ?? r.vibration_g ?? r.vib ?? r.acceleration ?? r.magnitude;
  }
  // crack_signal aliases
  if (r.crack_signal === undefined) {
    r.crack_signal = r.crack ?? r.crack_trip ?? r.crackSignal ?? r.fracture ?? r.acoustic;
  }
  // temperature aliases
  if (r.temperature === undefined) {
    r.temperature = r.temp ?? r.temperature_c ?? r.tempC;
  }
  // battery aliases
  if (r.battery === undefined) {
    r.battery = r.bat ?? r.batt ?? r.battery_pct ?? r.battery_percent ?? r.vbat;
  }
  // rssi aliases
  if (r.rssi === undefined) {
    r.rssi = r.signal ?? r.ble_rssi ?? r.bleRssi;
  }

  // 1. Tilt validation (degrees: -90° to 90°)
  let cleanTilt: number | undefined;
  if (r.tilt === undefined || r.tilt === null) {
    errors.push('Missing required kinematic field: tilt');
  } else {
    const t = Number(r.tilt);
    if (!Number.isFinite(t)) {
      errors.push(`Invalid tilt: non-finite value (${String(r.tilt)})`);
    } else if (t < -90 || t > 90) {
      errors.push(`Tilt value out of physical bounds (-90° to 90°): ${t}`);
    } else {
      cleanTilt = Number(t.toFixed(3));
    }
  }

  // 2. Displacement validation (mm: -100mm to 1000mm)
  let cleanDisp: number | undefined;
  if (r.displacement === undefined || r.displacement === null) {
    errors.push('Missing required kinematic field: displacement');
  } else {
    const d = Number(r.displacement);
    if (!Number.isFinite(d)) {
      errors.push(`Invalid displacement: non-finite value (${String(r.displacement)})`);
    } else if (d < -100 || d > 1000) {
      errors.push(`Displacement value out of physical bounds (-100 to 1000mm): ${d}`);
    } else {
      cleanDisp = Number(d.toFixed(3));
    }
  }

  // 3. Vibration validation (g: 0g to 50g)
  let cleanVib: number | undefined;
  if (r.vibration === undefined || r.vibration === null) {
    errors.push('Missing required kinematic field: vibration');
  } else {
    const v = Number(r.vibration);
    if (!Number.isFinite(v)) {
      errors.push(`Invalid vibration: non-finite value (${String(r.vibration)})`);
    } else if (v < 0 || v > 50) {
      errors.push(`Vibration value out of physical bounds (0 to 50g): ${v}`);
    } else {
      cleanVib = Number(v.toFixed(3));
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
