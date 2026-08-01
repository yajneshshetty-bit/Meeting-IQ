/**
 * MeetingIQ OpenAI model provider — registered in Zambyl model_catalog (Phase 7).
 * Loaded by Zambyl gateway via module_path; reads OPENAI_API_KEY from process.env.
 */

function buildContextPrompt(context, variables) {
  return JSON.stringify(
    {
      input: variables?.input || {},
      nodes: context?.nodeOutputs || {},
    },
    null,
    2,
  );
}

function renderPrompt(template, context, variables) {
  const llm = template?.spec?.llm || template?.llm || {};
  const ctx = buildContextPrompt(context, variables);
  const user = (llm.user || llm.user_prompt || 'Analyze the sales context and respond with valid JSON only.\n\nContext:\n{{context}}')
    .replace('{{context}}', ctx)
    .replace('{{input}}', JSON.stringify(variables?.input || {}));
  return {
    system: llm.system || 'You are MeetingIQ, an enterprise sales intelligence assistant. Respond with concise, actionable JSON.',
    user,
  };
}

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return JSON.parse(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  throw new Error('LLM response did not contain JSON');
}

export function createProvider() {
  return {
    id: 'openai-model-provider',
    async generate({ template, context, variables, modelClass }) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured — set it in Zambyl gateway environment');
      }

      const model = process.env.LLM_MODEL || 'gpt-4o-mini';
      const baseUrl = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
      const { system, user } = renderPrompt(template, context, variables);

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(60000),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error?.message || `OpenAI API error ${res.status}`);
      }

      const content = body.choices?.[0]?.message?.content || '{}';
      const output = extractJson(content);
      const tokens = body.usage?.total_tokens || 0;

      if (!output.provenance) {
        output.provenance = {
          provider: 'openai-model-provider',
          model,
          model_class: modelClass,
          generated_at: new Date().toISOString(),
        };
      }

      return { output, tokens };
    },
  };
}
