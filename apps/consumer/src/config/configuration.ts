export default () => ({
  // these should be set to process.env
  poller: {
    telemetryEndpoint: 'http://localhost:3000/telemetry',
    messageChannelName: 'telemetry',
  },
});
