module.exports = function(env) {
  var options = {
      host: env.get('STATSD_HOST'),
      port: env.get('STATSD_PORT'),
      prefix: env.get('STATSD_PREFIX') || env.get('NODE_ENV') + ".thimble",
      // If we don't have a host configured, use a mock object (no stats sent).
      mock: !env.get('STATSD_HOST')
    },
    statsd = new (require('node-statsd').StatsD)(options);
  return statsd;
};
