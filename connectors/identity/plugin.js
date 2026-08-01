import { createProviderFactory } from '../common/mock-delta-sync.js';
import { mapIdentityChange } from '../common/mappers.js';

export const createProvider = createProviderFactory({
  id: 'meetingiq.identity',
  version: '1.0.0',
  mapChange: mapIdentityChange,
});
