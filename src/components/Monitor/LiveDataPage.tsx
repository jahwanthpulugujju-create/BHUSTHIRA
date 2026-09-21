/**
 * STRATUM — LIVE DATA Page
 * Real-time field telemetry dashboard.
 * Subscribes to the transport-agnostic telemetry registry and renders
 * live sensor readings, waveform history, packet diagnostics, and
 * connection health for the currently active field node.
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

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (H / 4) * i;
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
  const statusColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#22c55e';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '10px',
      padding: '14px 16px',
      border: `1px solid ${isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#1e293b'}`,
      boxShadow: isCritical ? '0 0 12px rgba(239,68,68,0.25)' : 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      transition: 'border-color 0.3s ease'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {label}
        </span>
        <span style={{
          fontSize: '10px', fontWeight: 700, padding: '2px 6px',
          borderRadius: '3px', background: statusColor + '22', color: statusColor
        }}>
          {isCritical ? '⚠ CRITICAL' : isWarning ? '! WARN' : '● NOMINAL'}
        </span>
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '26px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace', lineHeight: 1 }}>
          {value !== null ? (Number.isInteger(value) ? value : value.toFixed(2)) : '---'}
        </span>
        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{unit}</span>
      </div>

      {/* Canvas waveform */}
      <canvas
        ref={canvasRef}
        width={240}
        height={52}
        style={{ width: '100%', height: '52px', borderRadius: '4px' }}
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
  const isConnected = state === 'CONNECTED';
  const isConnecting = state === 'CONNECTING' || state === 'SCANNING' || state === 'RECONNECTING';
  const isError = state === 'ERROR';

  const bannerColor = isConnected ? '#16a34a' : isError ? '#dc2626' : isConnecting ? '#0284c7' : '#475569';
  const bannerBg = isConnected ? 'rgba(22,163,74,0.1)' : isError ? 'rgba(220,38,38,0.1)' : isConnecting ? 'rgba(2,132,199,0.1)' : 'rgba(71,85,105,0.1)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 16px', borderRadius: '8px',
      background: bannerBg, border: `1px solid ${bannerColor}40`,
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: bannerColor,
          animation: isConnecting ? 'pulse 1.2s ease-in-out infinite' : 'none',
          boxShadow: isConnected ? `0 0 8px ${bannerColor}` : 'none'
        }} />
        <span style={{ fontSize: '12px', fontWeight: 700, color: bannerColor, letterSpacing: '0.06em' }}>
          {state}
        </span>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
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
              padding: '6px 14px', borderRadius: '5px', border: 'none',
              background: isSupported ? '#09332c' : '#334155',
              color: isSupported ? '#4ade80' : '#64748b',
              fontSize: '12px', fontWeight: 700, cursor: isSupported ? 'pointer' : 'not-allowed',
              transition: 'opacity 0.2s ease'
            }}
          >
            <Wifi size={13} />
            {isSupported ? 'CONNECT FIELD NODE' : 'WEB BLUETOOTH NOT SUPPORTED'}
          </button>
        )}
        {(isConnected || isConnecting) && (
          <button
            onClick={onDisconnect}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '5px', border: 'none',
              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              transition: 'opacity 0.2s ease'
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
      background: '#0a0f1e',
      borderRadius: '8px',
      border: '1px solid #1e293b',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '8px 14px',
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Hash size={12} color="#22d3ee" />
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', letterSpacing: '0.08em' }}>
          PACKET STREAM
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: '10px', padding: '1px 6px',
          background: 'rgba(34,211,238,0.1)', color: '#22d3ee',
          borderRadius: '3px', fontFamily: 'monospace'
        }}>
          LAST {packets.length} PACKETS
        </span>
      </div>
      <div
        ref={feedRef}
        style={{
          height: '200px', overflowY: 'auto', padding: '6px 0',
          fontFamily: 'monospace', fontSize: '11px'
        }}
      >
        {packets.length === 0 ? (
          <div style={{ color: '#475569', padding: '20px', textAlign: 'center' }}>
            No packets received — connect a field node to begin ingestion
          </div>
        ) : (
          [...packets].reverse().map((pkt, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 70px 60px 60px 60px 1fr',
                gap: '8px',
                padding: '3px 14px',
                color: i === 0 ? '#a5f3fc' : '#64748b',
                background: i === 0 ? 'rgba(34,211,238,0.05)' : 'transparent',
                transition: 'background 0.3s ease'
              }}
            >
              <span>{new Date(pkt.received_at).toLocaleTimeString('en-IN', { hour12: false })}</span>
              <span style={{ color: '#94a3b8' }}>{pkt.node_id}</span>
              <span style={{ color: '#fbbf24' }}>{pkt.tilt.toFixed(1)}°</span>
              <span style={{ color: '#34d399' }}>{pkt.displacement.toFixed(1)}mm</span>
              <span style={{ color: '#f87171' }}>{pkt.vibration.toFixed(3)}g</span>
              <span style={{ color: '#22d3ee', fontSize: '10px' }}>
                {pkt.source} | Q:{pkt.quality} {pkt.rssi !== undefined ? `| RSSI:${pkt.rssi}dBm` : ''}
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
      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      borderRadius: '10px',
      border: '1px solid #1e293b',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: '8px 14px', background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <BarChart2 size={12} color="#a78bfa" />
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em' }}>
          TRANSPORT DIAGNOSTICS
        </span>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1px', background: '#1e293b'
      }}>
        {items.map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            background: '#0f172a', padding: '10px 12px',
            display: 'flex', flexDirection: 'column', gap: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Icon size={11} color={color} />
              <span style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', letterSpacing: '0.07em' }}>
                {label}
              </span>
            </div>
            <span style={{ fontSize: '16px', fontWeight: 800, color, fontFamily: 'monospace' }}>
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
      <div style={{ background: '#0f172a', borderRadius: '12px', padding: '16px' }}>
        <ConnectionBanner
          state={connectionState}
          message={statusMessage}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          isSupported={isSupported}
        />

        {/* ── Sensor Waveform Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
          <Waveform
            label="GROUND TILT"
            unit="°"
            color="#fbbf24"
            data={series.tilt}
            value={latestPacket?.tilt ?? null}
            min={0} max={20}
            warning={5} critical={10}
          />
          <Waveform
            label="DISPLACEMENT"
            unit="mm"
            color="#34d399"
            data={series.displacement}
            value={latestPacket?.displacement ?? null}
            min={0} max={50}
            warning={15} critical={30}
          />
          <Waveform
            label="VIBRATION"
            unit="g"
            color="#f87171"
            data={series.vibration}
            value={latestPacket?.vibration ?? null}
            min={0} max={2}
            warning={0.8} critical={1.5}
          />
          <Waveform
            label="TEMPERATURE"
            unit="°C"
            color="#fb923c"
            data={series.temperature}
            value={latestPacket?.temperature ?? null}
            min={0} max={80}
            warning={55} critical={70}
          />
          <Waveform
            label="BATTERY"
            unit="%"
            color="#a78bfa"
            data={series.battery}
            value={latestPacket?.battery ?? null}
            min={0} max={100}
            warning={25} critical={10}
          />

          {/* Crack Signal Indicator */}
          <div style={{
            background: latestPacket?.crack_signal
              ? 'linear-gradient(135deg, #450a0a, #7f1d1d)'
              : 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderRadius: '10px',
            padding: '14px 16px',
            border: `1px solid ${latestPacket?.crack_signal ? '#ef4444' : '#1e293b'}`,
            boxShadow: latestPacket?.crack_signal ? '0 0 20px rgba(239,68,68,0.4)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            animation: latestPacket?.crack_signal ? 'pulse 0.8s ease-in-out infinite' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <AlertTriangle
              size={32}
              color={latestPacket?.crack_signal ? '#ef4444' : '#334155'}
            />
            <span style={{
              fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em',
              color: latestPacket?.crack_signal ? '#fca5a5' : '#475569',
              textTransform: 'uppercase'
            }}>
              ACOUSTIC CRACK SIGNAL
            </span>
            <span style={{
              fontSize: '20px', fontWeight: 800, fontFamily: 'monospace',
              color: latestPacket?.crack_signal ? '#ef4444' : '#1e293b'
            }}>
              {latestPacket?.crack_signal ? 'TRIP' : latestPacket ? 'CLEAR' : '---'}
            </span>
          </div>
        </div>

        {/* ── Diagnostics ── */}
        <DiagnosticsPanel diag={diagnostics} />
      </div>

      {/* ── Packet Feed ── */}
      <PacketFeed packets={packetFeed} />

      {/* ── No-hardware notice ── */}
      {!isSupported && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)',
          fontSize: '12px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <AlertTriangle size={14} color="#f59e0b" />
          <span>
            <strong>Web Bluetooth not available.</strong> Use Chrome/Edge on Windows/Android, or run on a device with BLE support. In simulation mode the waveforms still populate from the synthetic telemetry pipeline.
          </span>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
