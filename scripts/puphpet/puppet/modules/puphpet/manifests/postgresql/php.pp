class puphpet::postgresql::php
 inherits puphpet::postgresql::params {

  $postgresql = $puphpet::params::hiera['postgresql']
  $php        = $puphpet::params::hiera['php']
  $hhvm       = $puphpet::params::hiera['hhvm']

  if array_true($php, 'install') {
    $php_package = 'php'
  } elsif array_true($hhvm, 'install') {
    $php_package = 'hhvm'
  } else {
    $php_package = false
  }

  if $php_package == 'php' and ! defined(Puphpet::Php::Module::Package['pgsql']) {
    puphpet::php::module::package { 'pgsql':
      service_autorestart => true,
    }
  }

}
