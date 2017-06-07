# Install client cli tool. See README.md for more details.
class postgresql::client (
  $file_ensure    = 'file',
  $validcon_script_path  = $postgresql::params::validcon_script_path,
  $package_name   = $postgresql::params::client_package_name,
  $package_ensure = 'present'
) inherits postgresql::params {
  validate_absolute_path($validcon_script_path)
  validate_string($package_name)

  package { 'postgresql-client':
    ensure => $package_ensure,
    name   => $package_name,
    tag    => 'postgresql',
  }

  file { $validcon_script_path:
    ensure => $file_ensure,
    source => 'puppet:///modules/postgresql/validate_postgresql_connection.sh',
    owner  => 0,
    group  => 0,
    mode   => '0755',
  }

}
