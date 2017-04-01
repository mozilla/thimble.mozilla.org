# This installs a Mongo Shard daemon. See README.md for more details.
class mongodb::mongos (
  $ensure           = $mongodb::params::mongos_ensure,
  $config           = $mongodb::params::mongos_config,
  $config_content   = undef,
  $configdb         = $mongodb::params::mongos_configdb,
  $service_manage   = $mongodb::params::mongos_service_manage,
  $service_provider = undef,
  $service_name     = $mongodb::params::mongos_service_name,
  $service_enable   = $mongodb::params::mongos_service_enable,
  $service_ensure   = $mongodb::params::mongos_service_ensure,
  $service_status   = $mongodb::params::mongos_service_status,
  $package_ensure   = $mongodb::params::package_ensure_mongos,
  $package_name     = $mongodb::params::mongos_package_name,
  $unixsocketprefix = $mongodb::params::mongos_unixsocketprefix,
  $pidfilepath      = $mongodb::params::mongos_pidfilepath,
  $logpath          = $mongodb::params::mongos_logpath,
  $fork             = $mongodb::params::mongos_fork,
  $bind_ip          = undef,
  $port             = undef,
  $restart          = $mongodb::params::mongos_restart,
) inherits mongodb::params {

  if ($ensure == 'present' or $ensure == true) {
    if $restart {
      anchor { 'mongodb::mongos::start': }->
      class { 'mongodb::mongos::install': }->
      # If $restart is true, notify the service on config changes (~>)
      class { 'mongodb::mongos::config': }~>
      class { 'mongodb::mongos::service': }->
      anchor { 'mongodb::mongos::end': }
    } else {
      anchor { 'mongodb::mongos::start': }->
      class { 'mongodb::mongos::install': }->
      # If $restart is false, config changes won't restart the service (->)
      class { 'mongodb::mongos::config': }->
      class { 'mongodb::mongos::service': }->
      anchor { 'mongodb::mongos::end': }
    }
  } else {
    anchor { 'mongodb::mongos::start': }->
    class { '::mongodb::mongos::service': }->
    class { '::mongodb::mongos::config': }->
    class { '::mongodb::mongos::install': }->
    anchor { 'mongodb::mongos::end': }
  }

}
