class puphpet::mariadb::server (
  $settings
){

  include ::puphpet::mariadb::params
  include ::puphpet::mysql::params
  include ::mysql::params

  $true_settings_no_pw = delete(deep_merge({
    'package_name'     => $puphpet::mariadb::params::package_server_name,
    'restart'          => true,
    'override_options' => $puphpet::mariadb::params::settings['override_options'],
    'service_name'     => 'mysql',
  }, $settings), ['version'])

  $true_settings = deep_merge({
    'root_password' => array_true($settings, 'root_password') ? {
      true    => $settings['root_password'],
      default => $::mysql::params::root_password
    }
  }, $true_settings_no_pw)

  $pidfile       = $true_settings['override_options']['mysqld']['pid-file']
  $user          = $true_settings['override_options']['mysqld']['user']
  $root_group    = $::mysql::params::root_group
  $tmpfiles_conf = '/usr/lib/tmpfiles.d/mariadb.conf'

  # Ensure PID file directory exists
  exec { 'Create pidfile parent directory':
    command => "mkdir -p $(dirname ${pidfile})",
    unless  => "test -d $(dirname ${pidfile})",
    before  => Class['mysql::server'],
    require => [
      User[$user],
      Group[$root_group]
    ],
  }
  -> exec { 'Set pidfile parent directory permissions':
    command => "chown ${user}:${root_group} $(dirname ${pidfile})",
  }
  -> exec { 'Create mariadb tmpfiles.d conf file':
    command => "echo \"d $(dirname ${pidfile}) 0755 ${user} ${root_group} -\" > ${tmpfiles_conf}",
    creates => $tmpfiles_conf,
    onlyif  => 'test -d /usr/lib/tmpfiles.d',
  }

  # Ensure the data directory exists
  if ! defined(File[$::mysql::params::datadir]) {
    file { $::mysql::params::datadir:
      ensure => directory,
      group  => $::mysql::params::root_group,
      before => Class['mysql::server']
    }
  }

  create_resources('class', {
    'mysql::server' => $true_settings
  })

}
