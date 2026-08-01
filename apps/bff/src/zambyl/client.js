import { config } from '../config.js';
import { zambylHeadersFromContext } from '../auth/context.js';

export class ZambylClient {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || config.zambyl.apiUrl;
    this.apiKey = options.apiKey || config.zambyl.apiKey;
    this.workloadId = options.workloadId || config.zambyl.workloadId;
  }

  /** @param {import('../auth/context.js').loadUserContext extends Function ? Awaited<ReturnType<import('../auth/context.js').loadUserContext>> : never} userContext */
  headersFor(userContext) {
    if (userContext) {
      return zambylHeadersFromContext({
        ...userContext,
        zambylApiKey: this.apiKey,
        zambylWorkloadId: this.workloadId,
      });
    }
    return {
      'x-api-key': this.apiKey,
      'x-workload-id': this.workloadId,
      'x-user-id': 'meetingiq-bff-system',
      'x-entitlements': 'platform.test',
    };
  }

  async request(path, { method = 'GET', userContext, body } = {}) {
    const url = `${this.apiUrl}${path}`;
    const headers = {
      accept: 'application/json',
      ...this.headersFor(userContext),
    };
    if (body) headers['content-type'] = 'application/json';

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(10000),
      });

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }

      return { ok: res.ok, status: res.status, data };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        data: { error: err.message, code: 'ZAMBYL_UNREACHABLE' },
      };
    }
  }

  async getHealth() {
    return this.request('/health');
  }

  async getCatalog(userContext) {
    return this.request('/v1/platform/catalog', { userContext });
  }

  /** @param {object} userContext @param {{ profile: string, query?: string, limit?: number }} params */
  async search(userContext, { profile, query = '', limit = 50 } = {}) {
    return this.request('/v1/search:query', {
      method: 'POST',
      userContext,
      body: { profile, query, limit },
    });
  }

  async executeExperience(userContext, { experience_id, input = {}, channel = 'stable' } = {}) {
    return this.request('/v1/experiences:execute', {
      method: 'POST',
      userContext,
      body: {
        experience_id,
        channel,
        input,
        response_mode: { mode: 'sync_or_operation', allow_partial: true },
      },
    });
  }
}

export const zambylClient = new ZambylClient();
