# = Type: postgresql::server::schema
#
# Create a new schema. See README.md for more details.
#
# == Requires:
#
# The database must exist and the PostgreSQL user should have enough privileges
#
# == Sample Usage:
#
# postgresql::server::schema {'private':
#     db => 'template1',
# }
#
define postgresql::server::schema(
  $db = $postgresql::server::default_database,
  $owner  = undef,
  $schema = $title,
  $connect_settings = $postgresql::server::default_connect_settings,
) {
  $user      = $postgresql::server::user
  $group     = $postgresql::server::group
  $psql_path = $postgresql::server::psql_path
  $version   = $postgresql::server::_version

  # If the connection settings do not contain a port, then use the local server port
  if $connect_settings != undef and has_key( $connect_settings, 'PGPORT') {
    $port = undef
  } else {
    $port = $postgresql::server::port
  }

  Postgresql_psql {
    db         => $db,
    psql_user  => $user,
    psql_group => $group,
    psql_path  => $psql_path,
    port       => $port,
    connect_settings => $connect_settings,
  }

  $schema_title   = "Create Schema '${title}'"
  $authorization = $owner? {
    undef   => '',
    default => "AUTHORIZATION \"${owner}\"",
  }

  $schema_command = "CREATE SCHEMA \"${schema}\" ${authorization}"
  $unless         = "SELECT nspname FROM pg_namespace WHERE nspname='${schema}'"

  postgresql_psql { $schema_title:
    command => $schema_command,
    unless  => $unless,
    require => Class['postgresql::server'],
  }

  if($owner != undef and defined(Postgresql::Server::Role[$owner])) {
    Postgresql::Server::Role[$owner]->Postgresql_psql[$schema_title]
  }
}
