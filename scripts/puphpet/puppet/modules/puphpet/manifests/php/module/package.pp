define puphpet::php::module::package (
  $service_autorestart
){

  include puphpet::php::params

  $package_name = downcase($name)

  if ! defined(Php::Module[$package_name]) {
    ::php::module { $package_name:
      service_autorestart => $service_autorestart,
      module_prefix       => $puphpet::php::params::package_prefix,
    }
  }

}
