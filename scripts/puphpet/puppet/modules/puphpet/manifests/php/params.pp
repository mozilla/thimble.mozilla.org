class puphpet::php::params
  inherits ::puphpet::params
{

  $version = $hiera['php']['settings']['version']

  $version_match = to_string($version) ? {
    /5\.5/    => '5.5',
    /5\.5\.*/ => '5.5',
    /55/      => '5.5',
    /55.*/    => '5.5',

    /5\.6/    => '5.6',
    /5\.6\.*/ => '5.6',
    /56/      => '5.6',
    /56.*/    => '5.6',

    /7\.0/    => '7.0',
    /7\.0\.*/ => '7.0',
    /70/      => '7.0',
    /70.*/    => '7.0',

    /7\.1/    => '7.1',
    /7\.1\.*/ => '7.1',
    /71/      => '7.1',
    /71.*/    => '7.1',

    default   => undef,
  }

  $version_int = to_string($version) ? {
    /5\.5/    => '55',
    /5\.5\.*/ => '55',
    /55/      => '55',
    /55.*/    => '55',

    /5\.6/    => '56',
    /5\.6\.*/ => '56',
    /56/      => '56',
    /56.*/    => '56',

    /7\.0/    => '70',
    /7\.0\.*/ => '70',
    /70/      => '70',
    /70.*/    => '70',

    /7\.1/    => '71',
    /7\.1\.*/ => '71',
    /71/      => '71',
    /71.*/    => '71',

    default   => undef,
  }

  $package_prefix = $::osfamily ? {
    'debian' => "php${version_match}-",
    'redhat' => 'php-',
  }

  $pecl_prefix = $::osfamily ? {
    'debian' => 'php-',
    'redhat' => 'php-pecl-',
  }

  $root_ini = $::osfamily ? {
    'debian' => "/etc/php/${version_match}/php.ini",
    'redhat' => '/etc/php.ini',
  }

  $fpm_ini = $::osfamily ? {
    'debian' => "/etc/php/${version_match}/fpm/php.ini",
    'redhat' => '/etc/php.ini',
  }

  $pid_file = $::osfamily ? {
    'debian' => '/run/php-fpm.pid',
    'redhat' => '/var/run/php-fpm.pid',
  }

  $bin = $::osfamily ? {
    'debian' => "/usr/bin/php${version_match}",
    'redhat' => '/usr/bin/php',
  }

  $cli_package = "${package_prefix}cli"
  $fpm_package = "${package_prefix}fpm"
  $dev_package = $::osfamily ? {
    'debian' => "${package_prefix}dev",
    'redhat' => "${package_prefix}devel",
  }

  $service = $fpm_package

  Package[$fpm_package]
  -> Puphpet::Php::Module::Package <| |>

  Package[$fpm_package]
  -> Puphpet::Php::Module::Pear <| |>

  Package[$fpm_package]
  -> Puphpet::Php::Module::Pecl <| |>

  Package[$fpm_package]
  -> Puphpet::Php::Ini <| |>

  Package[$fpm_package]
  -> Puphpet::Php::Fpm::Ini <| |>

  Package[$fpm_package]
  -> Puphpet::Php::Fpm::Pool_ini <| |>

}
