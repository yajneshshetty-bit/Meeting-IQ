/** Attach freshness metadata to BFF read-model responses (MIQ-002 prep). */

export function withFreshness(data, { watermark, source = 'zambyl', pending = 0, confidence = 'high' } = {}) {
  return {
    data,
    freshness: {
      last_synced: watermark || new Date().toISOString(),
      source,
      pending_updates: pending,
      confidence,
    },
  };
}

export function watermarkFromSearch(metadata) {
  return metadata?.watermark?.as_of || null;
}
