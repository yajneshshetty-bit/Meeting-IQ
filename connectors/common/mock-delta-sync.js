/**
 * Shared sync logic for MeetingIQ mock REST enterprise services.
 * Uses each mock service's /v1/delta endpoint for batch + incremental modes.
 */

export function createMockDeltaConnector({ id, version, mapChange }) {
  return {
    id,
    version,
    capabilities: ['BATCH_READ', 'INCREMENTAL_READ', 'REST', 'POLLING', 'WEBHOOK'],
    async sync(connection, mode) {
      const baseUrl = connection.config?.base_url;
      if (!baseUrl) throw new Error('base_url required in connection config');
      const apiKey = connection.config?.api_key || 'mock-enterprise-key';
      const checkpoint = connection.checkpoint || {};
      const cursor = mode === 'incremental' ? String(checkpoint.change_id || '0') : '0';

      const res = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/delta?cursor=${cursor}&limit=500`, {
        headers: { 'x-api-key': apiKey },
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Mock API ${baseUrl} returned ${res.status}: ${text}`);
      }

      const data = await res.json();
      const changes = data.changes || [];
      const records = changes.map((change) => mapChange(change, connection));

      const maxChangeId = changes.length
        ? Math.max(...changes.map((c) => Number(c.change_id)))
        : Number(checkpoint.change_id || 0);

      return {
        records,
        cursor_after: {
          change_id: maxChangeId,
          synced_at: new Date().toISOString(),
        },
      };
    },
    async healthCheck() {
      return { healthy: true };
    },
  };
}

export function createProviderFactory(spec) {
  return function createProvider() {
    return createMockDeltaConnector(spec);
  };
}
