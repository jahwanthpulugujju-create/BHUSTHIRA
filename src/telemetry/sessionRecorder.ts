/**
 * Live Session Recorder (IndexedDB with In-Memory fallback)
 * Records physical telemetry sessions for incident audit and historical replay.
 */

import type { NormalizedTelemetry, TelemetrySessionRecord, OperatingMode, TelemetrySource } from './types';

const DB_NAME = 'stratum_telemetry_db';
const DB_VERSION = 1;
const STORE_NAME = 'sessions';

class SessionRecorder {
  private currentSession: TelemetrySessionRecord | null = null;
  private inMemorySessions: Map<string, TelemetrySessionRecord> = new Map();
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  constructor() {
    this.initDb();
  }

  private initDb(): Promise<IDBDatabase | null> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      this.dbPromise = Promise.resolve(null);
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('IndexedDB unavailable, using in-memory session store');
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  /**
   * Start a new recording session
   */
  startSession(mode: OperatingMode = 'LIVE', source: TelemetrySource = 'BLE', nodeId = 'N01'): string {
    const sessionId = `SESSION-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    this.currentSession = {
      id: sessionId,
      name: `${source} Live Session (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})`,
      mode,
      source,
      nodeId,
      startedAt: now,
      packetCount: 0,
      packets: [],
      maxRiskScore: 0,
      riskTrajectory: []
    };

    this.inMemorySessions.set(sessionId, this.currentSession);
    this.persistCurrentSession();
    return sessionId;
  }

  /**
   * Record an incoming telemetry packet
   */
  recordPacket(packet: NormalizedTelemetry, currentRiskScore = 0, currentRiskBand = 'NORMAL'): void {
    if (!this.currentSession) {
      this.startSession(packet.source === 'SIMULATION' ? 'SIMULATION' : 'LIVE', packet.source, packet.node_id);
    }

    if (this.currentSession) {
      this.currentSession.packetCount++;
      // Limit in-memory packet buffer to 1000 items per session
      if (this.currentSession.packets.length < 1000) {
        this.currentSession.packets.push(packet);
      }
      if (currentRiskScore > this.currentSession.maxRiskScore) {
        this.currentSession.maxRiskScore = currentRiskScore;
      }
      this.currentSession.riskTrajectory.push({
        timestamp: packet.timestamp,
        riskScore: currentRiskScore,
        riskBand: currentRiskBand
      });

      // Periodic throttle persistence
      if (this.currentSession.packetCount % 5 === 0) {
        this.persistCurrentSession();
      }
    }
  }

  /**
   * End current recording session
   */
  endSession(): TelemetrySessionRecord | null {
    if (!this.currentSession) return null;
    this.currentSession.endedAt = new Date().toISOString();
    const session = { ...this.currentSession };
    this.persistCurrentSession();
    this.currentSession = null;
    return session;
  }

  getCurrentSession(): TelemetrySessionRecord | null {
    return this.currentSession;
  }

  /**
   * List all saved sessions
   */
  async getAllSessions(): Promise<TelemetrySessionRecord[]> {
    const db = await this.initDb();
    if (!db) {
      return Array.from(this.inMemorySessions.values()).reverse();
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const results: TelemetrySessionRecord[] = req.result || [];
          // Merge in-memory active session if not yet fully flushed
          if (this.currentSession && !results.some(s => s.id === this.currentSession?.id)) {
            results.push(this.currentSession);
          }
          resolve(results.reverse());
        };
        req.onerror = () => resolve(Array.from(this.inMemorySessions.values()).reverse());
      } catch {
        resolve(Array.from(this.inMemorySessions.values()).reverse());
      }
    });
  }

  private async persistCurrentSession(): Promise<void> {
    if (!this.currentSession) return;
    const db = await this.initDb();
    if (!db) return;

    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(this.currentSession);
    } catch (err) {
      console.warn('Failed to persist session to IndexedDB:', err);
    }
  }
}

export const sessionRecorder = new SessionRecorder();
