import { createProviderFactory } from '../common/mock-delta-sync.js';
import { mapDocumentsChange } from '../common/mappers.js';

export const createProvider = createProviderFactory({
  id: 'meetingiq.documents',
  version: '1.0.0',
  mapChange: mapDocumentsChange,
});
