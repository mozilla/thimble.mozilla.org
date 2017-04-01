# This class installs the postgresql-docs See README.md for more
# details.
class postgresql::lib::docs (
  $package_name   = $postgresql::params::docs_package_name,
  $package_ensure = 'present',
) inherits postgresql::params {

  validate_string($package_name)

  package { 'postgresql-docs':
    ensure => $package_ensure,
    name   => $package_name,
    tag    => 'postgresql',
  }

}
