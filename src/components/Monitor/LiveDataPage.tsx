/**
 * STRATUM — LIVE DATA Page
 * Real-time field telemetry dashboard — light theme.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity, Wifi, WifiOff, AlertTriangle, CheckCircle,
  Radio, BarChart2, RefreshCw,
  Clock, Hash, Signal, TrendingDown
} from 'lucide-react';
import { telemetryRegistry } from '../../telemetry/telemetryRegistry';
import type { NormalizedTelemetry, TelemetryConnectionState, DiagnosticsMetrics } from '../../telemetry/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimeSeriesPoint {
  t: number; // epoch ms
  v: number;
}

interface LiveSeries {
  tilt: TimeSeriesPoint[];
  displacement: TimeSeriesPoint[];
  vibration: TimeSeriesPoint[];
  temperature: TimeSeriesPoint[];
  battery: TimeSeriesPoint[];
}

const MAX_HISTORY = 60; // keep last 60 samples

// ─── Mini Waveform Canvas ────────────────────────────────────────────────────

interface WaveformProps {
  data: TimeSeriesPoint[];
  color: string;
  unit: string;
  label: string;
  value: number | null;
  min?: number;
  max?: number;
  warning?: number;
  critical?: number;
}

const Waveform: React.FC<WaveformProps> = ({
  data, color, label, unit, value, min = 0, max = 100, warning, critical
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Subtle grid lines (light)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = (H / 3) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Clamp helper
    const clamp = (v: number) => Math.max(min, Math.min(max, v));
    const toX = (i: number) => (i / (MAX_HISTORY - 1)) * W;
    const toY = (v: number) => H - ((clamp(v) - min) / (max - min)) * H;

    // Fill gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '00');
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(data[0].v));
    data.forEach((pt, i) => ctx.lineTo(toX(i), toY(pt.v)));
    ctx.lineTo(toX(data.length - 1), H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.moveTo(toX(0), toY(data[0].v));
    data.forEach((pt, i) => ctx.lineTo(toX(i), toY(pt.v)));
    ctx.stroke();
  }, [data, color, min, max]);

  const isWarning = warning !== undefined && value !== null && value >= warning;
  const isCritical = critical !== undefined && value !== null && value >= critical;

  const statusBg    = isCritical ? '#fee2e2' : isWarning ? '#fef3c7' : '#dcfce7';
  const statusText  = isCritical ? '#b91c1c' : isWarning ? '#92400e' : '#15803d';
  const statusLabel = isCritical ? '⚠ CRITICAL' : isWarning ? '! WARNING' : '● NOMINAL';
  const cardBorder  = isCritical ? '#fca5a5' : isWarning ? '#fcd34d' : '#e2e8f0';

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '10px',
      padding: '14px 16px',
      border: `1px solid ${cardBorder}`,
      boxShadow: isCritical
        ? '0 0 0 3px rgba(239,68,68,0.12), 0 1px 4px rgba(0,0,0,0.06)'
        : '0 1px 3px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{
          fontSize: '10px', fontWeight: 700, padding: '2px 7px',
          borderRadius: '4px', background: statusBg, color: statusText
        }}>
          {statusLabel}
        </span>
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '26px', fontWeight: 800, color: isCritical ? '#dc2626' : '#0f172a', fontFamily: 'monospace', lineHeight: 1 }}>
          {value !== null ? (Number.isInteger(value) ? value : value.toFixed(2)) : '—'}
        </span>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>{unit}</span>
      </div>

      {/* Canvas waveform */}
      <canvas
        ref={canvasRef}
        width={240}
        height={48}
        style={{ width: '100%', height: '48px', borderRadius: '4px', background: '#f8fafc' }}
      />
    </div>
  );
};

// ─── Connection Banner ────────────────────────────────────────────────────────

const ConnectionBanner: React.FC<{
  state: TelemetryConnectionState;
  message: string;
  onConnect: () => void;
  onDisconnect: () => void;
  isSupported: boolean;
}> = ({ state, message, onConnect, onDisconnect, isSupported }) => {
  const isConnected  = state === 'CONNECTED';
  const isConnecting = state === 'CONNECTING' || state === 'SCANNING' || state === 'RECONNECTING';
  const isError      = state === 'ERROR';

  const dotColor  = isConnected ? '#16a34a' : isError ? '#dc2626' : isConnecting ? '#0284c7' : '#94a3b8';
  const bg        = isConnected ? '#f0fdf4' : isError ? '#fef2f2' : isConnecting ? '#eff6ff' : '#f8fafc';
  const border    = isConnected ? '#bbf7d0' : isError ? '#fecaca' : isConnecting ? '#bfdbfe' : '#e2e8f0';
  const textColor = isConnected ? '#15803d' : isError ? '#b91c1c' : isConnecting ? '#1d4ed8' : '#475569';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px', borderRadius: '8px',
      background: bg, border: `1px solid ${border}`
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '9px', height: '9px', borderRadius: '50%',
          background: dotColor,
          boxShadow: isConnected ? `0 0 6px ${dotColor}` : 'none',
          animation: isConnecting ? 'liveDataPulse 1.1s ease-in-out infinite' : 'none'
        }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: textColor, letterSpacing: '0.06em' }}>
          {state}
        </span>
        <span style={{ fontSize: '12px', color: '#64748b' }}>
          {message}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {!isConnected && !isConnecting && (
          <button
            onClick={onConnect}
            disabled={!isSupported}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '6px',
              border: isSupported ? '1px solid #09332c' : '1px solid #cbd5e1',
              background: isSupported ? '#09332c' : '#f1f5f9',
              color: isSupported ? '#ffffff' : '#94a3b8',
              fontSize: '12px', fontWeight: 700,
              cursor: isSupported ? 'pointer' : 'not-allowed'
            }}
          >
            <Wifi size={13} />
            {isSupported ? 'CONNECT FIELD NODE' : 'WEB BLUETOOTH UNAVAILABLE'}
          </button>
        )}
        {(isConnected || isConnecting) && (
          <button
            onClick={onDisconnect}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '6px',
              border: '1px solid #fecaca',
              background: '#fff1f2', color: '#b91c1c',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            <WifiOff size={13} />
            DISCONNECT
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Packet Feed ──────────────────────────────────────────────────────────────

const PacketFeed: React.FC<{ packets: NormalizedTelemetry[] }> = ({ packets }) => {
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [packets]);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 14px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <Hash size={13} color="#0284c7" />
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          PACKET STREAM
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: '10px', padding: '1px 7px',
          background: '#eff6ff', color: '#0284c7',
          borderRadius: '4px', fontFamily: 'monospace', fontWeight: 600
        }}>
          LAST {packets.length} PACKETS
        </span>
      </div>
      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '140px 70px 60px 70px 60px 1fr',
        gap: '8px', padding: '4px 14px',
        background: '#f8fafc', borderBottom: '1px solid #e2e8f0'
      }}>
        {['TIME','NODE','TILT','DISPL','VIB','META'].map(h => (
          <span key={h} style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em' }}>{h}</span>
        ))}
      </div>
      <div
        ref={feedRef}
        style={{ height: '180px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px' }}
      >
        {packets.length === 0 ? (
          <div style={{ color: '#94a3b8', padding: '24px', textAlign: 'center' }}>
            No packets — connect a field node to begin ingestion
          </div>
        ) : (
          [...packets].reverse().map((pkt, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 70px 60px 70px 60px 1fr',
                gap: '8px',
                padding: '4px 14px',
                background: i === 0 ? '#eff6ff' : i % 2 === 0 ? '#f8fafc' : '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                color: '#334155'
              }}
            >
              <span style={{ color: '#475569' }}>{new Date(pkt.received_at).toLocaleTimeString('en-IN', { hour12: false })}</span>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>{pkt.node_id}</span>
              <span style={{ color: '#b45309' }}>{pkt.tilt.toFixed(1)}°</span>
              <span style={{ color: '#15803d' }}>{pkt.displacement.toFixed(1)}mm</span>
              <span style={{ color: '#b91c1c' }}>{pkt.vibration.toFixed(3)}g</span>
              <span style={{ color: '#0284c7', fontSize: '10px' }}>
                {pkt.source} | Q:{pkt.quality}{pkt.rssi !== undefined ? ` | RSSI:${pkt.rssi}dBm` : ''}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── Diagnostics Panel ────────────────────────────────────────────────────────

const DiagnosticsPanel: React.FC<{ diag: DiagnosticsMetrics }> = ({ diag }) => {
  const items = [
    { label: 'TOTAL PACKETS', value: diag.packetCount, color: '#94a3b8', icon: Hash },
    { label: 'VALID', value: diag.validPackets, color: '#22c55e', icon: CheckCircle },
    { label: 'MALFORMED', value: diag.malformedPackets, color: '#ef4444', icon: AlertTriangle },
    { label: 'SEQ GAPS', value: diag.sequenceGaps, color: '#f59e0b', icon: TrendingDown },
    { label: 'RECONNECTS', value: diag.reconnectCount, color: '#a78bfa', icon: RefreshCw },
    { label: 'PACKET RATE', value: `${diag.packetRateHz.toFixed(1)} Hz`, color: '#38bdf8', icon: Activity },
    { label: 'LATENCY', value: `${diag.transportLatencyMs.toFixed(0)} ms`, color: '#fb923c', icon: Clock },
    { label: 'STALE EVENTS', value: diag.staleTransitions, color: '#fbbf24', icon: Signal },
  ];

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '10px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    }}>
      <div style={{
        padding: '8px 14px', background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <BarChart2 size={13} color="#7c3aed" />
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          TRANSPORT DIAGNOSTICS
        </span>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px', background: '#e2e8f0'
      }}>
        {items.map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            background: '#ffffff', padding: '10px 14px',
            display: 'flex', flexDirection: 'column', gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Icon size={11} color={color} />
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em' }}>
                {label}
              </span>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color, fontFamily: 'monospace' }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main LiveDataPage ────────────────────────────────────────────────────────

export const LiveDataPage: React.FC = () => {
  const [connectionState, setConnectionState] = useState<TelemetryConnectionState>(telemetryRegistry.connectionState);
  const [statusMessage, setStatusMessage] = useState<string>(telemetryRegistry.statusMessage);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsMetrics>(telemetryRegistry.getDiagnostics());
  const [latestPacket, setLatestPacket] = useState<NormalizedTelemetry | null>(null);
  const [packetFeed, setPacketFeed] = useState<NormalizedTelemetry[]>([]);
  const [series, setSeries] = useState<LiveSeries>({
    tilt: [], displacement: [], vibration: [], temperature: [], battery: []
  });
  const [packetCount, setPacketCount] = useState(0);
  const isSupported = telemetryRegistry.ble.isSupported;

  // Subscribe to state changes
  useEffect(() => {
    const unsubState = telemetryRegistry.subscribeState(() => {
      setConnectionState(telemetryRegistry.connectionState);
      setStatusMessage(telemetryRegistry.statusMessage);
      setDiagnostics(telemetryRegistry.getDiagnostics());
    });
    return unsubState;
  }, []);

  // Subscribe to telemetry packets
  useEffect(() => {
    const unsubTelemetry = telemetryRegistry.subscribeTelemetry((packet: NormalizedTelemetry) => {
      const now = Date.now();

      setLatestPacket(packet);
      setPacketCount(c => c + 1);

      setPacketFeed(prev => {
        const next = [...prev, packet];
        return next.length > 50 ? next.slice(-50) : next;
      });

      setSeries(prev => {
        const push = (arr: TimeSeriesPoint[], v: number | undefined): TimeSeriesPoint[] => {
          if (v === undefined) return arr;
          const next = [...arr, { t: now, v }];
          return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
        };
        return {
          tilt: push(prev.tilt, packet.tilt),
          displacement: push(prev.displacement, packet.displacement),
          vibration: push(prev.vibration, packet.vibration),
          temperature: push(prev.temperature, packet.temperature),
          battery: push(prev.battery, packet.battery)
        };
      });
    });
    return unsubTelemetry;
  }, []);

  const handleConnect = useCallback(async () => {
    await telemetryRegistry.connectFieldHardware();
  }, []);

  const handleDisconnect = useCallback(async () => {
    await telemetryRegistry.disconnectFieldHardware();
  }, []);

  const isConnected = connectionState === 'CONNECTED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '100%' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
            <Radio size={16} color="#22d3ee" />
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em' }}>
              LIVE DATA
            </h1>
            <span style={{
              fontSize: '9px', fontWeight: 700, padding: '2px 6px',
              background: isConnected ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.1)',
              color: isConnected ? '#16a34a' : '#64748b',
              borderRadius: '3px', letterSpacing: '0.08em',
              border: `1px solid ${isConnected ? '#16a34a' : '#94a3b8'}40`
            }}>
              {isConnected ? '● FIELD TELEMETRY ACTIVE' : '○ AWAITING CONNECTION'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Real-time sensor ingestion from field node via transport-agnostic telemetry pipeline
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            padding: '6px 12px', borderRadius: '6px',
            background: '#f1f5f9', border: '1px solid #e2e8f0',
            fontSize: '11px', color: '#475569', fontFamily: 'monospace'
          }}>
            <span style={{ color: '#94a3b8' }}>PACKETS: </span>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>{packetCount.toLocaleString()}</span>
          </div>
          {latestPacket && (
            <div style={{
              padding: '6px 12px', borderRadius: '6px',
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              fontSize: '11px', color: '#475569', fontFamily: 'monospace'
            }}>
              <span style={{ color: '#94a3b8' }}>NODE: </span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{latestPacket.node_id}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Connection Banner ── */}
      <ConnectionBanner
        state={connectionState}
        message={statusMessage}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        isSupported={isSupported}
      />

      {/* ── Sensor Waveform Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <Waveform
          label="GROUND TILT"   unit="°"  color="#d97706"
          data={series.tilt}         value={latestPacket?.tilt ?? null}
          min={0} max={20}  warning={5} critical={10}
        />
        <Waveform
          label="DISPLACEMENT"  unit="mm" color="#15803d"
          data={series.displacement} value={latestPacket?.displacement ?? null}
          min={0} max={50}  warning={15} critical={30}
        />
        <Waveform
          label="VIBRATION"     unit="g"  color="#b91c1c"
          data={series.vibration}    value={latestPacket?.vibration ?? null}
          min={0} max={2}   warning={0.8} critical={1.5}
        />
        <Waveform
          label="TEMPERATURE"   unit="°C" color="#ea580c"
          data={series.temperature}  value={latestPacket?.temperature ?? null}
          min={0} max={80}  warning={55} critical={70}
        />
        <Waveform
          label="BATTERY"       unit="%"  color="#7c3aed"
          data={series.battery}      value={latestPacket?.battery ?? null}
          min={0} max={100} warning={25} critical={10}
        />

        {/* ── Crack Signal Card (light) ── */}
        <div style={{
          background: latestPacket?.crack_signal ? '#fef2f2' : '#ffffff',
          border: `1px solid ${latestPacket?.crack_signal ? '#fca5a5' : '#e2e8f0'}`,
          borderRadius: '10px',
          padding: '14px 16px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', gap: '8px',
          boxShadow: latestPacket?.crack_signal
            ? '0 0 0 3px rgba(239,68,68,0.12), 0 1px 4px rgba(0,0,0,0.06)'
            : '0 1px 3px rgba(0,0,0,0.06)',
          animation: latestPacket?.crack_signal ? 'liveDataPulse 0.9s ease-in-out infinite' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, color: '#64748b',
            letterSpacing: '0.07em', textTransform: 'uppercase', alignSelf: 'flex-start'
          }}>
            ACOUSTIC CRACK SIGNAL
          </span>
          <AlertTriangle size={36} color={latestPacket?.crack_signal ? '#dc2626' : '#cbd5e1'} />
          <span style={{
            fontSize: '22px', fontWeight: 800, fontFamily: 'monospace',
            color: latestPacket?.crack_signal ? '#dc2626' : '#94a3b8'
          }}>
            {latestPacket?.crack_signal ? 'TRIP' : latestPacket ? 'CLEAR' : '—'}
          </span>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
            background: latestPacket?.crack_signal ? '#fee2e2' : '#dcfce7',
            color: latestPacket?.crack_signal ? '#b91c1c' : '#15803d'
          }}>
            {latestPacket?.crack_signal ? '⚠ FRACTURE EVENT' : '● NO EVENT'}
          </span>
        </div>
      </div>

      {/* ── Transport Diagnostics ── */}
      <DiagnosticsPanel diag={diagnostics} />

      {/* ── Packet Feed ── */}
      <PacketFeed packets={packetFeed} />

      {/* ── No-hardware notice ── */}
      {!isSupported && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: '#fefce8', border: '1px solid #fde68a',
          fontSize: '12px', color: '#78350f', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <AlertTriangle size={14} color="#d97706" />
          <span>
            <strong>Web Bluetooth unavailable.</strong> Use Chrome or Edge on Windows / Android. In simulation mode the waveforms still populate from the synthetic telemetry pipeline.
          </span>
        </div>
      )}

      <style>{`
        @keyframes liveDataPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};
