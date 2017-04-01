define puphpet::php::module::pecl (
  $service_autorestart,
  $prefix = $puphpet::php::params::pecl_prefix
){

  include puphpet::php::params

  $package_name = downcase($name)

  $package_name_split = split($package_name, '-')

  if ! defined(Php::Pecl::Module[$package_name]) {
    ::php::pecl::module { $package_name:
      use_package         => false,
      service_autorestart => $service_autorestart,
    }

    if ! defined(Puphpet::Php::Ini[$package_name]) {
      puphpet::php::ini { $package_name_split[0]:
        entry        => 'MODULE/extension',
        value        => "${package_name_split[0]}.so",
        php_version  => $puphpet::php::params::version_match,
        webserver    => $puphpet::php::params::service,
        ini_filename => "${package_name_split[0]}.ini",
      }
    }
  }

}
