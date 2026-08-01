import { createProviderFactory } from '../common/mock-delta-sync.js';
import { mapSupportChange } from '../common/mappers.js';

export const createProvider = createProviderFactory({
  id: 'meetingiq.support',
  version: '1.0.0',
  mapChange: mapSupportChange,
});
