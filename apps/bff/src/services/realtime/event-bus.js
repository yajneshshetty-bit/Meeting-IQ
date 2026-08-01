/** In-process pub/sub for SSE clients (MIQ-002). */

/** @type {Set<(event: object) => void>} */
const subscribers = new Set();

export function subscribe(handler) {
  subscribers.add(handler);
  return () => subscribers.delete(handler);
}

export function broadcast(event) {
  for (const handler of subscribers) {
    try {
      handler(event);
    } catch {
      /* client disconnected */
    }
  }
  return subscribers.size;
}

export function subscriberCount() {
  return subscribers.size;
}
