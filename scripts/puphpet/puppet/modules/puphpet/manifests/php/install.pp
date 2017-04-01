# == Class: puphpet::php::install
#
# Installs PHP.
#
# Usage:
#
#  class { 'puphpet::php::install': }
#
class puphpet::php::install
 inherits puphpet::php::params {

  include ::php::params

  $php     = $puphpet::params::hiera['php']
  $mailhog = $puphpet::params::hiera['mailhog']

  $settings = $php['settings']

  $root_ini      = $puphpet::php::params::root_ini
  $package       = $puphpet::php::params::fpm_package
  $package_devel = $puphpet::php::params::dev_package
  $service       = $puphpet::php::params::service

  case $::osfamily {
    'debian': {
      class { 'puphpet::php::repo::debian': }
    }
    'redhat': {
      class { 'puphpet::php::repo::centos':
        version => $puphpet::php::params::version_int,
      }
    }
  }

  if ! defined(Service[$service]) {
    class { 'php':
      package             => $package,
      package_devel       => $package_devel,
      service             => $service,
      version             => 'present',
      service_autorestart => false,
      config_file         => $root_ini,
    }

    if ! defined(Package[$package_devel]) {
      package { $package_devel :
        ensure  => present,
        require => Class['php']
      }
    }

    service { $service:
      ensure     => 'running',
      enable     => true,
      hasrestart => true,
      hasstatus  => true,
      require    => Package[$package]
    }
  }

  include puphpet::php::alternatives

  include puphpet::php::fpm::config

  include puphpet::php::modules

  $php_inis = merge({
    'cgi.fix_pathinfo' => 1,
  }, $php['ini'])

  each( $php_inis ) |$key, $value| {
    if is_array($value) {
      each( $php_inis[$key] ) |$inner_key, $inner_value| {
        puphpet::php::ini { "${key}_${inner_key}":
          entry       => "CUSTOM_${inner_key}/${key}",
          value       => $inner_value,
          php_version => $puphpet::php::params::version_match,
          webserver   => $service,
          notify      => Service[$service],
        }
      }
    } else {
      puphpet::php::ini { $key:
        entry       => "CUSTOM/${key}",
        value       => $value,
        php_version => $puphpet::php::params::version_match,
        webserver   => $service,
      }
    }
  }

  if array_true($php_inis, 'session.save_path') {
    $session_save_path = $php_inis['session.save_path']

    # Handles URLs like tcp://127.0.0.1:6379
    # absolute file paths won't have ":"
    if ! (':' in $session_save_path) and $session_save_path != '/tmp' {
      exec { "mkdir -p ${session_save_path}" :
        creates => $session_save_path,
        notify  => Service[$service],
      }

      if ! defined(File[$session_save_path]) {
        file { $session_save_path:
          ensure  => directory,
          owner   => 'www-data',
          group   => 'www-data',
          mode    => '0775',
          require => Exec["mkdir -p ${session_save_path}"],
        }
      }

      exec { 'set php session path owner/group':
        creates => "${puphpet::params::puphpet_state_dir}/php-session-path-owner-group",
        command => "chown www-data ${session_save_path} && \
                    chgrp www-data ${session_save_path} && \
                    touch ${puphpet::params::puphpet_state_dir}/php-session-path-owner-group",
        require => [
          File[$session_save_path],
          Package[$package]
        ],
      }
    }
  }

  if array_true($php, 'composer') and ! defined(Class['puphpet::php::composer']) {
    class { 'puphpet::php::composer':
      php_package   => $puphpet::php::params::cli_package,
      composer_home => $php['composer_home'],
    }
  }

  # Usually this would go within the library that needs it  (MailHog)
  # but the values required are sufficiently complex that it's easier to
  # add here
  if array_true($mailhog, 'install')
    and ! defined(Puphpet::Php::Ini['sendmail_path'])
  {
    puphpet::php::ini { 'sendmail_path':
      entry       => 'CUSTOM/sendmail_path',
      value       => "${mailhog['settings']['path']} sendmail foo@example.com",
      php_version => $puphpet::php::params::version_match,
      webserver   => $service,
      notify      => Service[$service],
    }
  }

  if $puphpet::php::params::version_match == '7.0' and $::osfamily == 'redhat' {
    exec { 'Fix pid_file path':
      command => "perl -p -i -e 's#/var/run/php-fpm/php-fpm.pid#/var/run/php-fpm.pid#gi' /etc/init.d/php-fpm",
      unless  => "grep -x '/var/run/php-fpm.pid' /etc/init.d/php-fpm",
      path    => [ '/bin/', '/sbin/', '/usr/bin/', '/usr/sbin/' ],
      notify  => Service[$service],
    }
  }

  if array_true($puphpet::params::hiera['xdebug'], 'install') {
    class { 'puphpet::php::xdebug::install': }
  }

}
