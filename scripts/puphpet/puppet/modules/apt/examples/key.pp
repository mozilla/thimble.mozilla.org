# Declare Apt key for apt.puppetlabs.com source
apt::key { 'puppetlabs':
  id      => '47B320EB4C7C375AA9DAE1A01054B7A24BD6EC30',
  server  => 'hkps.pool.sks-keyservers.net',
  options => 'http-proxy="http://proxyuser:proxypass@example.org:3128"',
}
