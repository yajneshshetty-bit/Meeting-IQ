import { createProviderFactory } from '../common/mock-delta-sync.js';
import { mapTasksChange } from '../common/mappers.js';

export const createProvider = createProviderFactory({
  id: 'meetingiq.tasks',
  version: '1.0.0',
  mapChange: mapTasksChange,
});
