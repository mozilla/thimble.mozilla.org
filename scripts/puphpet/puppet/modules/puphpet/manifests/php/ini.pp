# Defines where we can expect PHP ini files and paths to be located.
#
# Different OS, OS version, webserver and PHP versions all contributes
# to making a mess of where we can expect INI files to be found.
#
# I have listed a bunch of places:
#
# 5.5
#     CENTOS 6
#         CLI   /etc/php.d
#         FPM   /etc/php.d
#     UBUNTU 14.04 TRUSTY
#         CLI   /etc/php/5.5/cli/conf.d/* -> /etc/php/mods-available/*
#         FPM   /etc/php/5.5/fpm/conf.d/* -> /etc/php/mods-available/*
# 5.6
#     CENTOS 6
#         CLI   /etc/php.d
#         FPM   /etc/php.d
#     UBUNTU 14.04 TRUSTY
#         CLI   /etc/php/5.6/cli/conf.d/* -> /etc/php/mods-available/*
#         FPM   /etc/php/5.6/fpm/conf.d/* -> /etc/php/mods-available/*
# 7.0
#     CENTOS 6
#         CLI   /etc/php.d
#         FPM   /etc/php.d
#     UBUNTU 14.04 TRUSTY
#         CLI   /etc/php/7.0/cli/conf.d/*  -> /etc/php/mods-available/*
#         FPM   /etc/php/7.0/fpm/conf.d/*  -> /etc/php/mods-available/*
#
define puphpet::php::ini (
  $php_version,
  $webserver,
  $ini_filename = 'zzzz_custom.ini',
  $entry,
  $value  = '',
  $ensure = present
  ) {

  case $php_version {
    '5.5': {
      case $::osfamily {
        'debian': {
          $base_dir = '/etc/php/5.5'

          $ini_dir  = "${base_dir}/mods-available"
          $ini_file = "${ini_dir}/${ini_filename}"

          $fpm_ini_symlink = "${base_dir}/fpm/conf.d/${ini_filename}"
          $cli_ini_symlink = "${base_dir}/cli/conf.d/${ini_filename}"
        }
        'redhat': {
          $ini_file = "/etc/php.d/${ini_filename}"

          $fpm_ini_symlink = false
          $cli_ini_symlink = false
        }
        default: { fail('This OS has not yet been defined for PHP 5.5!') }
      }
    }
    '5.6': {
      case $::osfamily {
        'debian': {
          $base_dir = '/etc/php/5.6'

          $ini_dir  = "${base_dir}/mods-available"
          $ini_file = "${ini_dir}/${ini_filename}"

          $fpm_ini_symlink = "${base_dir}/fpm/conf.d/${ini_filename}"
          $cli_ini_symlink = "${base_dir}/cli/conf.d/${ini_filename}"
        }
        'redhat': {
          $ini_file = "/etc/php.d/${ini_filename}"

          $fpm_ini_symlink = false
          $cli_ini_symlink = false
        }
        default: { fail('This OS has not yet been defined for PHP 5.6!') }
      }
    }
    '7.0': {
      case $::osfamily {
        'debian': {
          $base_dir = '/etc/php/7.0'

          $ini_dir  = "${base_dir}/mods-available"
          $ini_file = "${ini_dir}/${ini_filename}"

          $fpm_ini_symlink = "${base_dir}/fpm/conf.d/${ini_filename}"
          $cli_ini_symlink = "${base_dir}/cli/conf.d/${ini_filename}"
        }
        'redhat': {
          $ini_file = "/etc/php.d/${ini_filename}"

          $fpm_ini_symlink = false
          $cli_ini_symlink = false
        }
        default: { fail('This OS has not yet been defined for PHP 7.0!') }
      }
    }
    '7.1': {
      case $::osfamily {
        'debian': {
          $base_dir = '/etc/php/7.1'

          $ini_dir  = "${base_dir}/mods-available"
          $ini_file = "${ini_dir}/${ini_filename}"

          $fpm_ini_symlink = "${base_dir}/fpm/conf.d/${ini_filename}"
          $cli_ini_symlink = "${base_dir}/cli/conf.d/${ini_filename}"
        }
        'redhat': {
          $ini_file = "/etc/php.d/${ini_filename}"

          $fpm_ini_symlink = false
          $cli_ini_symlink = false
        }
        default: { fail('This OS has not yet been defined for PHP 7.1!') }
      }
    }
    default: { fail('Unrecognized PHP version') }
  }

  if $webserver != undef {
    $notify_service = Service[$webserver]
  } else {
    $notify_service = []
  }

  if '=' in $value {
    $changes = $ensure ? {
      present => [ "set '${entry}' \"'${value}'\"" ],
      absent  => [ "rm \"'${entry}'\"" ],
    }
  }
  else {
    $changes = $ensure ? {
      present => [ "set '${entry}' '${value}'" ],
      absent  => [ "rm '${entry}'" ],
    }
  }

  if ! defined(File[$ini_file]) {
    file { $ini_file:
      replace => no,
      ensure  => present,
    }
  }

  if $webserver != undef
    and $fpm_ini_symlink
    and ! defined(File[$fpm_ini_symlink])
  {
    file { $fpm_ini_symlink:
      ensure  => link,
      target  => $ini_file,
      require => File[$ini_file],
    }
  }

  if $cli_ini_symlink and ! defined(File[$cli_ini_symlink]) {
    file { $cli_ini_symlink:
      ensure  => link,
      target  => $ini_file,
      require => File[$ini_file],
    }
  }

  augeas { "${entry}: ${value}":
    lens    => 'PHP.lns',
    incl    => $ini_file,
    changes => $changes,
    notify  => $notify_service,
  }

}
