import { createProviderFactory } from '../common/mock-delta-sync.js';
import { mapMailChange } from '../common/mappers.js';

export const createProvider = createProviderFactory({
  id: 'meetingiq.mail',
  version: '1.0.0',
  mapChange: mapMailChange,
});
