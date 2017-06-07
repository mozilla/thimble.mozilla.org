# Class for installing redis database
#
# If PHP is chosen for install , redis module is also installed
#
class puphpet::redis::install {

  include ::puphpet::params
  include ::redis::params

  $redis  = $puphpet::params::hiera['redis']
  $apache = $puphpet::params::hiera['apache']
  $nginx  = $puphpet::params::hiera['nginx']
  $php    = $puphpet::params::hiera['php']

  if $::operatingsystem == 'ubuntu' and $::lsbdistcodename == 'trusty' {
    $manage_repo = true
  } else {
    $manage_repo = false
  }

  if array_true($apache, 'install') or array_true($nginx, 'install') {
    $webserver_restart = true
  } else {
    $webserver_restart = false
  }

  if array_true($redis['settings'], 'conf_port') {
    $port = $redis['settings']['conf_port']
  } else {
    $port = $redis['settings']['port']
  }

  $settings = delete(deep_merge({
    'port'        => $port,
    'manage_repo' => $manage_repo,
  }, $redis['settings']), 'conf_port')

  $config_owner = $redis::params::config_owner
  $config_group = $redis::params::config_group

  # Non-Debian install does not create this directory by default
  if ! defined(File['/var/run/redis']) and $::osfamily != 'Debian' {
    file { '/var/run/redis':
      ensure  => 'directory',
      owner   => $config_owner,
      group   => $config_group,
      require => Class['redis'],
    }
  }

  $tmpfiles_conf = '/usr/lib/tmpfiles.d/redis.conf'

  if ! defined(File[$tmpfiles_conf]) {
    file { $tmpfiles_conf:
      ensure  => 'present',
      content => "d /var/run/redis 0755 ${config_owner} ${config_group} -",
      owner   => $config_owner,
      group   => 'root',
      require => Class['redis'],
    }
  }

  create_resources('class', { 'redis' => $settings })

  if array_true($php, 'install') and ! defined(Puphpet::Php::Module::Pecl['redis']) {
    puphpet::php::module::pecl { 'redis':
      service_autorestart => $webserver_restart,
      require             => Class['redis']
    }
  }

}
