class puphpet::mariadb::php
 inherits puphpet::mariadb::params {

  include puphpet::php::params

  $mariadb = $puphpet::params::hiera['mariadb']
  $php     = $puphpet::params::hiera['php']
  $hhvm    = $puphpet::params::hiera['hhvm']

  if array_true($php, 'install') {
    $php_package = 'php'
  } elsif array_true($hhvm, 'install') {
    $php_package = 'hhvm'
  } else {
    $php_package = false
  }

  if $php_package == 'php' {
    $php_module = $::osfamily ? {
      'debian' => 'mysqlnd',
      'redhat' => 'mysql',
    }

    if ! defined(Puphpet::Php::Module::Package[$php_module]) {
      puphpet::php::module::package { $php_module:
        service_autorestart => true,
      }
    }
  }

}
