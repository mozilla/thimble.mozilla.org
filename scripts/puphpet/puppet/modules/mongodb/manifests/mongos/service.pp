# PRIVATE CLASS: do not call directly
class mongodb::mongos::service (
  $service_manage   = $mongodb::mongos::service_manage,
  $service_name     = $mongodb::mongos::service_name,
  $service_enable   = $mongodb::mongos::service_enable,
  $service_ensure   = $mongodb::mongos::service_ensure,
  $service_status   = $mongodb::mongos::service_status,
  $service_provider = $mongodb::mongos::service_provider,
  $bind_ip          = $mongodb::mongos::bind_ip,
  $port             = $mongodb::mongos::port,
) {

  $service_ensure_real = $service_ensure ? {
    'absent'  => false,
    'purged'  => false,
    'stopped' => false,
    default   => true
  }

  if $port {
    $port_real = $port
  } else {
    $port_real = '27017'
  }

  if $bind_ip == '0.0.0.0' {
    $bind_ip_real = '127.0.0.1'
  } else {
    $bind_ip_real = $bind_ip
  }

  if $::osfamily == 'RedHat' {
    file { '/etc/sysconfig/mongos' :
      ensure  => file,
      owner   => 'root',
      group   => 'root',
      mode    => '0755',
      content => 'OPTIONS="--quiet -f /etc/mongodb-shard.conf"',
      before  => Service['mongos'],
    }
  }

  file { '/etc/init.d/mongos' :
    ensure  => file,
    content => template("mongodb/mongos/${::osfamily}/mongos.erb"),
    owner   => 'root',
    group   => 'root',
    mode    => '0755',
    before  => Service['mongos'],
  }

  if $service_manage {
    service { 'mongos':
      ensure    => $service_ensure_real,
      name      => $service_name,
      enable    => $service_enable,
      provider  => $service_provider,
      hasstatus => true,
      status    => $service_status,
    }

    if $service_ensure_real {
      mongodb_conn_validator { 'mongos':
        server  => $bind_ip_real,
        port    => $port_real,
        timeout => '240',
        require => Service['mongos'],
      }
    }
  }

}
