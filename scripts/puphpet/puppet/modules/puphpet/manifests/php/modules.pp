class puphpet::php::modules
 inherits puphpet::php::params {

  $php     = $puphpet::params::hiera['php']
  $service = $puphpet::php::params::service

  # config file could contain no modules.php key
  $php_modules = array_true($php['modules'], 'php') ? {
    true    => $php['modules']['php'],
    default => { }
  }

  Puphpet::Php::Module::Package <| |>
  -> Puphpet::Php::Module::Pear <| |>

  Puphpet::Php::Module::Package <| |>
  -> Puphpet::Php::Module::Pecl <| |>

  each( $php_modules ) |$name| {
    if ! defined(Puphpet::Php::Module::Package[$name]) {
      puphpet::php::module::package { $name:
        service_autorestart => true,
        notify              => Service[$service],
      }
    }
  }

  # config file could contain no modules.pear key
  $pear_modules = array_true($php['modules'], 'pear') ? {
    true    => $php['modules']['pear'],
    default => { }
  }

  each( $pear_modules ) |$name| {
    if ! defined(Puphpet::Php::Module::Pear[$name]) {
      puphpet::php::module::pear { $name:
        service_autorestart => true,
        notify              => Service[$service],
      }
    }
  }

  # config file could contain no modules.pecl key
  $pecl_modules = array_true($php['modules'], 'pecl') ? {
    true    => $php['modules']['pecl'],
    default => { }
  }

  each( $pecl_modules ) |$name| {
    if ! defined(Puphpet::Php::Extra_repos[$name]) {
      puphpet::php::extra_repos { $name:
        before => Puphpet::Php::Module::Pecl[$name],
      }
    }

    if ! defined(Puphpet::Php::Module::Pecl[$name]) {
      puphpet::php::module::pecl { $name:
        service_autorestart => true,
        notify              => Service[$service],
      }
    }
  }

}
