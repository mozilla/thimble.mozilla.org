# Defines where we can expect PHP-FPM ini files and paths to be located.
#
# ubuntu 14.04
#    7.1
#        /etc/php/7.1/fpm/php-fpm.conf
#    7.0
#        /etc/php/7.0/fpm/php-fpm.conf
#    5.6
#        /etc/php/5.6/fpm/php-fpm.conf
#    5.5
#        /etc/php/5.5/fpm/php-fpm.conf
# centos 6.x
#    7.1
#        /etc/php-fpm.conf
#    7.0
#        /etc/php-fpm.conf
#    5.6
#        /etc/php-fpm.conf
#    5.5
#        /etc/php-fpm.conf
#
define puphpet::php::fpm::ini (
  $fpm_version,
  $entry,
  $value  = '',
  $ensure = present,
  $php_fpm_service
  ) {

  $pool_name = 'global'

  $conf_filename = $fpm_version ? {
    '7.1'   => $::osfamily ? {
      'debian' => '/etc/php/7.1/fpm/php-fpm.conf',
      'redhat' => '/etc/php-fpm.conf',
    },
    '7.0'   => $::osfamily ? {
      'debian' => '/etc/php/7.0/fpm/php-fpm.conf',
      'redhat' => '/etc/php-fpm.conf',
    },
    '5.6'   => $::osfamily ? {
      'debian' => '/etc/php/5.6/fpm/php-fpm.conf',
      'redhat' => '/etc/php-fpm.conf',
    },
    '5.5'   => $::osfamily ? {
      'debian' => '/etc/php/5.5/fpm/php-fpm.conf',
      'redhat' => '/etc/php-fpm.conf',
    },
    default => fail('Unsupported PHP version selected')
  }

  if '=' in $value {
    $changes = $ensure ? {
      present => [ "set '${pool_name}/${entry}' \"'${value}'\"" ],
      absent  => [ "rm \"'${pool_name}/${entry}'\"" ],
    }
  }
  else {
    $changes = $ensure ? {
      present => [ "set '${pool_name}/${entry}' '${value}'" ],
      absent  => [ "rm \"'${pool_name}/${entry}'\"" ],
    }
  }

  augeas { "${pool_name}/${entry}: ${value}":
    lens    => 'PHP.lns',
    incl    => $conf_filename,
    changes => $changes,
    notify  => Service[$php_fpm_service],
  }

}
