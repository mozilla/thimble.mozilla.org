# Class for installing XHProf
#
class puphpet::xhprof {

  include ::puphpet::params
  include ::puphpet::apache::params
  include ::puphpet::nginx::params
  include ::puphpet::php::params

  $xhprof = $puphpet::params::hiera['xhprof']
  $apache = $puphpet::params::hiera['apache']
  $nginx  = $puphpet::params::hiera['nginx']
  $php    = $puphpet::params::hiera['php']

  if array_true($apache, 'install') or array_true($nginx, 'install') {
    $service = $puphpet::php::params::service
  } else {
    $service = undef
  }

  if array_true($apache, 'install') {
    $webroot = $puphpet::apache::params::default_vhost_dir
  } elsif array_true($nginx, 'install') {
    $webroot = $puphpet::nginx::params::webroot_location
  } else {
    $webroot = $xhprof['location']
  }

  if ! defined(Package['graphviz']) {
    package { 'graphviz':
      ensure => present,
    }
  }

  class { 'puphpet::php::xhprof':
    php_version       => $php['settings']['version'],
    webroot_location  => $webroot,
    webserver_service => $service
  }

}
