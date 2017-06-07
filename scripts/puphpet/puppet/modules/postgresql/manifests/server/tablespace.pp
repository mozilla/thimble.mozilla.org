# This module creates tablespace. See README.md for more details.
define postgresql::server::tablespace(
  $location,
  $owner   = undef,
  $spcname = $title,
  $connect_settings = $postgresql::server::default_connect_settings,
) {
  $user      = $postgresql::server::user
  $group     = $postgresql::server::group
  $psql_path = $postgresql::server::psql_path

  # If the connection settings do not contain a port, then use the local server port
  if $connect_settings != undef and has_key( $connect_settings, 'PGPORT') {
    $port = undef
  } else {
    $port = $postgresql::server::port
  }

  Postgresql_psql {
    psql_user        => $user,
    psql_group       => $group,
    psql_path        => $psql_path,
    port             => $port,
    connect_settings => $connect_settings,
  }

  if ($owner == undef) {
    $owner_section = ''
  } else {
    $owner_section = "OWNER \"${owner}\""
  }

  $create_tablespace_command = "CREATE TABLESPACE \"${spcname}\" ${owner_section} LOCATION '${location}'"

  file { $location:
    ensure  => directory,
    owner   => $user,
    group   => $group,
    mode    => '0700',
    seluser => 'system_u',
    selrole => 'object_r',
    seltype => 'postgresql_db_t',
    require => Class['postgresql::server'],
  }

  $create_ts = "Create tablespace '${spcname}'"
  postgresql_psql { "Create tablespace '${spcname}'":
    command => $create_tablespace_command,
    unless  => "SELECT spcname FROM pg_tablespace WHERE spcname='${spcname}'",
    require => [Class['postgresql::server'], File[$location]],
  }

  if($owner != undef and defined(Postgresql::Server::Role[$owner])) {
    Postgresql::Server::Role[$owner]->Postgresql_psql[$create_ts]
  }
}
