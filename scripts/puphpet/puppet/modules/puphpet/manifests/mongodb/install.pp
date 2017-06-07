# == Class: puphpet::mongodb::install
#
# Installs MongoDB.
#
# Usage:
#
#  class { 'puphpet::mongodb::install': }
#
class puphpet::mongodb::install
 inherits puphpet::mongodb::params {

  include puphpet::php::params

  $mongodb = $puphpet::params::hiera['mongodb']
  $php     = $puphpet::params::hiera['php']

  $settings = $mongodb['settings']

  file { ['/data', '/data/db']:
    ensure => directory,
    mode   => '0775',
    before => Class['mongodb::globals'],
  }

  Class['mongodb::globals']
  -> Class['mongodb::server']
  -> Class['mongodb::client']

  create_resources('class', {
    'mongodb::globals' => $puphpet::mongodb::params::merged_globals
  })

  create_resources('class', {
    'mongodb::server' => $mongodb['settings']
  })

  class { 'mongodb::client': }

  if ! defined(Package['mongodb-org-tools']) {
    package {'mongodb-org-tools':
      require => Class['mongodb::client']
    }
  }

  include puphpet::mongodb::directories

  each( $mongodb['databases'] ) |$key, $database| {
    $merged = delete(merge($database, {
      'dbname' => $database['name'],
      require  => Package['mongodb-org-tools'],
    }), 'name')

    create_resources( puphpet::mongodb::db, {
      "${database['user']}@${database['name']}" => $merged
    })
  }

  if array_true($php, 'install') and ! defined(Puphpet::Php::Module::Pecl['mongo']) {
    $php_version_int = 0 + $puphpet::php::params::version_int

    if $php_version_int >= 70 {
      $php_package = 'mongodb'
    }
    else {
      $php_package = 'mongo'
    }

    puphpet::php::module::pecl { $php_package:
      service_autorestart => true,
      require             => Class['mongodb::server']
    }
  }

}
