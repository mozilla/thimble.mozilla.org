class puphpet::mysql::params
 inherits puphpet::params
{

  include ::mysql::params

  $version = to_string($hiera['mysql']['settings']['version'])

  $server_package = $::osfamily ? {
    'debian' => 'mysql-server',
    'redhat' => 'mysql-community-server',
  }

  $client_package = $::osfamily ? {
    'debian' => 'mysql-client',
    'redhat' => 'mysql-community-client',
  }

  $root_password = array_true($hiera['mysql']['settings'], 'root_password') ? {
    true    => $hiera['mysql']['settings']['root_password'],
    default => $::mysql::params::root_password
  }

}
