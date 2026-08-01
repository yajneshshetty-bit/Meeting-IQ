export const config = {
  port: Number(process.env.MEETINGIQ_PORT || 3001),
  host: process.env.MEETINGIQ_HOST || '0.0.0.0',
  databaseUrl: process.env.MEETINGIQ_DATABASE_URL || 'postgres://meetingiq:meetingiq@localhost:5434/meetingiq',
  zambyl: {
    apiUrl: (process.env.ZAMBYL_API_URL || 'http://localhost:8080').replace(/\/$/, ''),
    apiKey: process.env.ZAMBYL_API_KEY || 'test-harness-key',
    workloadId: process.env.ZAMBYL_WORKLOAD_ID || 'meetingiq-bff',
  },
  devDefaultUserId: process.env.MEETINGIQ_DEV_DEFAULT_USER_ID || 'user_alex',
};
