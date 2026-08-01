import { useEffect, useRef } from 'react';
import { getStoredUserId } from '../api/client.js';
import { useUser } from '../context/UserContext.jsx';

function parseSseChunk(buffer) {
  const events = [];
  const parts = buffer.split('\n\n');
  const remainder = parts.pop() || '';
  for (const part of parts) {
    if (!part.trim()) continue;
    let eventType = 'message';
    let dataLine = '';
    for (const line of part.split('\n')) {
      if (line.startsWith('event:')) eventType = line.slice(6).trim();
      if (line.startsWith('data:')) dataLine += line.slice(5).trim();
    }
    if (dataLine) {
      try {
        events.push({ type: eventType, data: JSON.parse(dataLine) });
      } catch {
        /* ignore malformed */
      }
    }
  }
  return { events, remainder };
}

/**
 * Subscribe to BFF SSE (fetch stream — supports x-meetingiq-user-id header).
 * @param {Record<string, () => void>} routeReloaders map of BFF route → reload fn
 */
export function useRealtimeInvalidation(routeReloaders = {}) {
  const { userId } = useUser();
  const reloadersRef = useRef(routeReloaders);
  reloadersRef.current = routeReloaders;

  useEffect(() => {
    const uid = userId || getStoredUserId();
    if (!uid) return;

    const controller = new AbortController();
    let buffer = '';

    (async () => {
      try {
        const res = await fetch('/api/events/stream', {
          headers: { 'x-meetingiq-user-id': uid },
          signal: controller.signal,
        });
        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseSseChunk(buffer);
          buffer = parsed.remainder;

          for (const evt of parsed.events) {
            if (evt.type !== 'widget.invalidate' && evt.data?.type !== 'widget.invalidate') continue;
            const payload = evt.data;
            for (const route of payload.routes || []) {
              reloadersRef.current[route]?.();
            }
          }
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          /* reconnect on next mount / navigation */
        }
      }
    })();

    return () => controller.abort();
  }, [userId]);
}
