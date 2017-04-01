# This class installs the PL/Python procedural language for postgresql. See
# README.md for more details.
class postgresql::server::plpython(
  $package_ensure = 'present',
  $package_name   = $postgresql::server::plpython_package_name,
) {
  package { 'postgresql-plpython':
    ensure => $package_ensure,
    name   => $package_name,
    tag    => 'postgresql',
  }

  anchor { 'postgresql::server::plpython::start': }->
  Class['postgresql::server::install']->
  Package['postgresql-plpython']->
  Class['postgresql::server::service']->
  anchor { 'postgresql::server::plpython::end': }

}
