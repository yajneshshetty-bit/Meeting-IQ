import { createProviderFactory } from '../common/mock-delta-sync.js';
import { mapSlackChange } from '../common/mappers.js';

export const createProvider = createProviderFactory({
  id: 'meetingiq.slack',
  version: '1.0.0',
  mapChange: mapSlackChange,
});
