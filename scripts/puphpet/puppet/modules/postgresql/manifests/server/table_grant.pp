# This resource wraps the grant resource to manage table grants specifically.
# See README.md for more details.
define postgresql::server::table_grant(
  $privilege,
  $table,
  $db,
  $role,
  $port             = undef,
  $psql_db          = undef,
  $psql_user        = undef,
  $connect_settings = undef,
  $onlyif_exists    = false,
) {
  postgresql::server::grant { "table:${name}":
    role             => $role,
    db               => $db,
    port             => $port,
    privilege        => $privilege,
    object_type      => 'TABLE',
    object_name      => $table,
    psql_db          => $psql_db,
    psql_user        => $psql_user,
    onlyif_exists    => $onlyif_exists,
    connect_settings => $connect_settings,
  }
}