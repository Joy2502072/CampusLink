// Lightweight cross-tab event bus using BroadcastChannel
// Powers live real-time simulation without heavy WebSocket server requirements

export type EventType =
  | "SHORTLISTED"
  | "SLOT_ASSIGNED"
  | "OFFER_ISSUED"
  | "DOCUMENT_DEADLINE"
  | "DRIVE_ANNOUNCED"
  | "TIMETABLE_RESOLVED"
  | "CANDIDATE_SHORTLISTED"
  | "OFFER_FOLLOWUP";

export interface BusEvent {
  id: string;
  type: EventType;
  title: string;
  message?: string;
  timestamp: string;
  studentId?: string;
  studentName?: string;
  companyName?: string;
  driveId?: string;
  data?: Record<string, unknown>;
}

class CampusEventBus {
  private channel: BroadcastChannel | null = null;
  private listeners: ((event: BusEvent) => void)[] = [];

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel("campuslink_events");
      this.channel.onmessage = (msg: MessageEvent<BusEvent>) => {
        this.notify(msg.data);
      };
    }
  }

  public publish(event: Omit<BusEvent, "id" | "timestamp">) {
    const fullEvent: BusEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Store in localStorage history
    try {
      const stored = localStorage.getItem("campuslink_recent_notifications");
      const list: BusEvent[] = stored ? JSON.parse(stored) : [];
      list.unshift(fullEvent);
      localStorage.setItem("campuslink_recent_notifications", JSON.stringify(list.slice(0, 20)));
    } catch {
      // Ignore storage errors in private browsing
    }

    // Broadcast across tabs
    if (this.channel) {
      this.channel.postMessage(fullEvent);
    }
    // Also notify current tab listeners
    this.notify(fullEvent);
  }

  public subscribe(callback: (event: BusEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify(event: BusEvent) {
    this.listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.error("Error in bus event listener:", err);
      }
    });
  }

  public getHistory(): BusEvent[] {
    try {
      const stored = localStorage.getItem("campuslink_recent_notifications");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export const eventBus = new CampusEventBus();
