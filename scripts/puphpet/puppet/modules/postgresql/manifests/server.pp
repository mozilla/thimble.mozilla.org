# This installs a PostgreSQL server. See README.md for more details.
class postgresql::server (
  $postgres_password          = undef,

  $package_name               = $postgresql::params::server_package_name,
  $client_package_name        = $postgresql::params::client_package_name,
  $package_ensure             = $postgresql::params::package_ensure,

  $plperl_package_name        = $postgresql::params::plperl_package_name,
  $plpython_package_name      = $postgresql::params::plpython_package_name,

  $service_ensure             = $postgresql::params::service_ensure,
  $service_enable             = $postgresql::params::service_enable,
  $service_manage             = $postgresql::params::service_manage,
  $service_name               = $postgresql::params::service_name,
  $service_restart_on_change  = $postgresql::params::service_restart_on_change,
  $service_provider           = $postgresql::params::service_provider,
  $service_reload             = $postgresql::params::service_reload,
  $service_status             = $postgresql::params::service_status,
  $default_database           = $postgresql::params::default_database,
  $default_connect_settings   = $postgresql::globals::default_connect_settings,
  $listen_addresses           = $postgresql::params::listen_addresses,
  $port                       = $postgresql::params::port,
  $ip_mask_deny_postgres_user = $postgresql::params::ip_mask_deny_postgres_user,
  $ip_mask_allow_all_users    = $postgresql::params::ip_mask_allow_all_users,
  $ipv4acls                   = $postgresql::params::ipv4acls,
  $ipv6acls                   = $postgresql::params::ipv6acls,

  $initdb_path                = $postgresql::params::initdb_path,
  $createdb_path              = $postgresql::params::createdb_path,
  $psql_path                  = $postgresql::params::psql_path,
  $pg_hba_conf_path           = $postgresql::params::pg_hba_conf_path,
  $pg_ident_conf_path         = $postgresql::params::pg_ident_conf_path,
  $postgresql_conf_path       = $postgresql::params::postgresql_conf_path,
  $recovery_conf_path         = $postgresql::params::recovery_conf_path,

  $datadir                    = $postgresql::params::datadir,
  $xlogdir                    = $postgresql::params::xlogdir,
  $logdir                     = $postgresql::params::logdir,

  $log_line_prefix            = $postgresql::params::log_line_prefix,

  $pg_hba_conf_defaults       = $postgresql::params::pg_hba_conf_defaults,

  $user                       = $postgresql::params::user,
  $group                      = $postgresql::params::group,

  $needs_initdb               = $postgresql::params::needs_initdb,

  $encoding                   = $postgresql::params::encoding,
  $locale                     = $postgresql::params::locale,

  $manage_pg_hba_conf         = $postgresql::params::manage_pg_hba_conf,
  $manage_pg_ident_conf       = $postgresql::params::manage_pg_ident_conf,
  $manage_recovery_conf       = $postgresql::params::manage_recovery_conf,

  #Deprecated
  $version                    = undef,
) inherits postgresql::params {
  $pg = 'postgresql::server'

  if $version != undef {
    warning('Passing "version" to postgresql::server is deprecated; please use postgresql::globals instead.')
    $_version = $version
  } else {
    $_version = $postgresql::params::version
  }

  if $createdb_path != undef{
    warning('Passing "createdb_path" to postgresql::server is deprecated, it can be removed safely for the same behaviour')
  }

  # Reload has its own ordering, specified by other defines
  class { "${pg}::reload": require => Class["${pg}::install"] }

  anchor { "${pg}::start": }->
  class { "${pg}::install": }->
  class { "${pg}::initdb": }->
  class { "${pg}::config": }->
  class { "${pg}::service": }->
  class { "${pg}::passwd": }->
  anchor { "${pg}::end": }
}
