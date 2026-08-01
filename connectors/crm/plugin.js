import { createProviderFactory } from '../common/mock-delta-sync.js';
import { mapCrmChange } from '../common/mappers.js';

export const createProvider = createProviderFactory({
  id: 'meetingiq.crm',
  version: '1.0.0',
  mapChange: mapCrmChange,
});
