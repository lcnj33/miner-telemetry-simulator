export default () => ({
  // these should be set to process.env
  poller: {
    numberOfMiners: 10,
    telemetryEndpoint: 'http://localhost:3000/telemetry',
    messageChannelName: 'telemetry',
  },
});
