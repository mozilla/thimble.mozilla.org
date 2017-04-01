class puphpet::php::alternatives
  inherits puphpet::php::params
{

  if $::osfamily == 'debian' {
    Package[$puphpet::php::params::dev_package]
    -> Puphpet::Alternatives_update <| |>

    Puphpet::Php::Module::Package <| |>
    -> Puphpet::Alternatives_update <| |>

    Puphpet::Php::Module::Pear <| |>
    -> Puphpet::Alternatives_update <| |>

    Puphpet::Php::Module::Pecl <| |>
    -> Puphpet::Alternatives_update <| |>

    Puphpet::Php::Ini <| |>
    -> Puphpet::Alternatives_update <| |>

    Puphpet::Php::Fpm::Ini <| |>
    -> Puphpet::Alternatives_update <| |>

    Puphpet::Php::Fpm::Pool_ini <| |>
    -> Puphpet::Alternatives_update <| |>

    puphpet::alternatives_update { 'php':
      item        => 'php',
      versiongrep => $puphpet::php::params::version_match,
      optional    => false,
      altcmd      => 'update-alternatives',
    }
  }

}
