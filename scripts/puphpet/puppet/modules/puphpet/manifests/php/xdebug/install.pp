class puphpet::php::xdebug::install
 inherits puphpet::php::xdebug::params {

  include ::puphpet::php::params

  $xdebug = $puphpet::params::hiera['xdebug']
  $php    = $puphpet::params::hiera['php']

  $compile = $puphpet::php::params::version_match ? {
    '7.1'   => true,
    default => false,
  }

  $xdebug_package = $::osfamily ? {
    'Debian' => "${puphpet::php::params::package_prefix}xdebug",
    'Redhat' => "${puphpet::php::params::pecl_prefix}xdebug"
  }

  if !$compile and ! defined(Package[$xdebug_package]) {
    package { 'xdebug':
      name    => $xdebug_package,
      ensure  => installed,
      require => Package[$puphpet::php::params::fpm_package],
      notify  => Service[$puphpet::php::params::service],
    }
  } elsif $compile {
    include ::puphpet::php::xdebug::compile
  }

  # shortcut for xdebug CLI debugging
  if ! defined(File['/usr/bin/xdebug']) {
    file { '/usr/bin/xdebug':
      ensure  => present,
      mode    => '+x',
      source  => 'puppet:///modules/puphpet/xdebug_cli_alias.erb',
      require => Package[$puphpet::php::params::fpm_package]
    }
  }

  each( $xdebug['settings'] ) |$key, $value| {
    puphpet::php::ini { $key:
      entry        => "XDEBUG/${key}",
      value        => $value,
      php_version  => $puphpet::php::params::version_match,
      ini_filename => '99-xdebug.ini',
      webserver    => $puphpet::php::params::service,
      notify       => Service[$puphpet::php::params::service],
    }
  }

}
