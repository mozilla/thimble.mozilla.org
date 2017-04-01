class puphpet::php::fpm::config
 inherits puphpet::php::params {

  $php = $puphpet::params::hiera['php']

  # config file could contain no fpm_ini key
  $fpm_inis = array_true($php, 'fpm_ini') ? {
    true    => $php['fpm_ini'],
    default => { }
  }

  $fpm_inis_merged = merge($fpm_inis, {
    'pid' => $puphpet::php::params::pid_file,
  })

  each( $fpm_inis_merged ) |$name, $value| {
    puphpet::php::fpm::ini { "${name}: ${value}":
      fpm_version     => $puphpet::php::params::version_match,
      entry           => $name,
      value           => $value,
      php_fpm_service => $puphpet::php::params::service
    }
  }

  # config file could contain no fpm_pools key
  $fpm_pools = array_true($php, 'fpm_pools') ? {
    true    => $php['fpm_pools'],
    default => { }
  }

  each( $fpm_pools ) |$pKey, $pool_settings| {
    $pool = $fpm_pools[$pKey]

    # pool could contain no ini key
    $ini_hash = array_true($pool, 'ini') ? {
      true    => $pool['ini'],
      default => { }
    }

    each( $ini_hash ) |$name, $value| {
      $pool_name = array_true($ini_hash, 'prefix') ? {
        true    => $ini_hash['prefix'],
        default => $pKey
      }

      if $name != 'prefix' {
        puphpet::php::fpm::pool_ini { "${pool_name}/${name}: ${value}":
          fpm_version     => $puphpet::php::params::version_match,
          pool_name       => $pool_name,
          entry           => $name,
          value           => $value,
          php_fpm_service => $puphpet::php::params::service
        }
      }
    }
  }

}
