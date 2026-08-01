import { createProviderFactory } from '../common/mock-delta-sync.js';
import { mapCalendarChange } from '../common/mappers.js';

export const createProvider = createProviderFactory({
  id: 'meetingiq.calendar',
  version: '1.0.0',
  mapChange: mapCalendarChange,
});
