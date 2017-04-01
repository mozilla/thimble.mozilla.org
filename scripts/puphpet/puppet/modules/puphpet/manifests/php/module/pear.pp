define puphpet::php::module::pear (
  $service_name = '',
  $service_autorestart,
){

  include puphpet::php::params

  $package_name = downcase($name)

  if ! defined(Php::Pear::Module[$package_name]) {
    ::php::pear::module { $package_name:
      use_package         => false,
      service             => $service_name,
      service_autorestart => $service_autorestart,
    }
  }

}
