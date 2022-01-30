export default () => ({
  poller: {
    messageChannelName: process.env.MSG_CHANNEL || 'telemetry',
    numberOfMiners: parseInt(process.env.NUM_OF_MINERS) || 10,
    telemetryEndpoint:
      process.env.ENDPOINT || 'http://localhost:3000/telemetry',
  },
});
