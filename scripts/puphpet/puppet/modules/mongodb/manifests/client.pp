# Class for installing a MongoDB client shell (CLI).
#
# == Parameters
#
# [ensure] Desired ensure state of the package. Optional.
#   Defaults to 'true'
#
# [package_name] Name of the package to install the client from. Default
#   is repository dependent.
#
class mongodb::client (
  $ensure       = $mongodb::params::package_ensure_client,
  $package_name = $mongodb::params::client_package_name,
) inherits mongodb::params {
  anchor { '::mongodb::client::start': } ->
  class { '::mongodb::client::install': } ->
  anchor { '::mongodb::client::end': }
}
