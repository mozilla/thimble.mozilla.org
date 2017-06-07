class puphpet::sqlite::php
 inherits puphpet::sqlite::params {

  $sqlite = $puphpet::params::hiera['sqlite']
  $php   = $puphpet::params::hiera['php']
  $hhvm  = $puphpet::params::hiera['hhvm']

  if array_true($php, 'install') {
    $php_package = 'php'
  } elsif array_true($hhvm, 'install') {
    $php_package = 'hhvm'
  } else {
    $php_package = false
  }

  case $::operatingsystem {
    'debian': {
      $php_sqlite = 'sqlite'
    }
    'ubuntu': {
      $php_sqlite = 'sqlite3'
    }
    'redhat', 'centos': {
      $php_sqlite = 'sqlite3'
    }
  }

  if $php_package == 'php' and ! defined(Puphpet::Php::Module::Package[$php_sqlite]) {
    puphpet::php::module::package { $php_sqlite:
      service_autorestart => true,
    }
  }

}
