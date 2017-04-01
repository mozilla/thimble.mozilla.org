#
class rabbitmq::install::rabbitmqadmin {

  if($rabbitmq::ssl and $rabbitmq::management_ssl) {
    $management_port = $rabbitmq::ssl_management_port
    $protocol        = 'https'
  } else {
    $management_port = $rabbitmq::management_port
    $protocol        = 'http'
  }

  $default_user = $rabbitmq::default_user
  $default_pass = $rabbitmq::default_pass
  $node_ip_address = $rabbitmq::node_ip_address

  if $rabbitmq::node_ip_address == 'UNSET' {
    # Pull from localhost if we don't have an explicit bind address
    $curl_prefix = ''
    $sanitized_ip = '127.0.0.1'
  } elsif is_ipv6_address($node_ip_address) {
    $curl_prefix  = "--noproxy ${node_ip_address} -g -6"
    $sanitized_ip = join(enclose_ipv6(any2array($node_ip_address)), ',')
  } else {
    $curl_prefix  = "--noproxy ${node_ip_address}"
    $sanitized_ip = $node_ip_address
  }

  staging::file { 'rabbitmqadmin':
    target      => "${rabbitmq::rabbitmq_home}/rabbitmqadmin",
    source      => "${protocol}://${default_user}:${default_pass}@${sanitized_ip}:${management_port}/cli/rabbitmqadmin",
    curl_option => "-k ${curl_prefix} --retry 30 --retry-delay 6",
    timeout     => '180',
    wget_option => '--no-proxy',
    require     => [
      Class['rabbitmq::service'],
      Rabbitmq_plugin['rabbitmq_management']
    ],
  }

  file { '/usr/local/bin/rabbitmqadmin':
    owner   => 'root',
    group   => '0',
    source  => "${rabbitmq::rabbitmq_home}/rabbitmqadmin",
    mode    => '0755',
    require => Staging::File['rabbitmqadmin'],
  }

}
