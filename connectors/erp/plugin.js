import { createProviderFactory } from '../common/mock-delta-sync.js';
import { mapErpChange } from '../common/mappers.js';

export const createProvider = createProviderFactory({
  id: 'meetingiq.erp',
  version: '1.0.0',
  mapChange: mapErpChange,
});
