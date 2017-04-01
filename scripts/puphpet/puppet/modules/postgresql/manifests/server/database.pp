# Define for creating a database. See README.md for more details.
define postgresql::server::database(
  $comment          = undef,
  $dbname           = $title,
  $owner            = $postgresql::server::user,
  $tablespace       = undef,
  $template         = 'template0',
  $encoding         = $postgresql::server::encoding,
  $locale           = $postgresql::server::locale,
  $istemplate       = false,
  $connect_settings = $postgresql::server::default_connect_settings,
) {
  $createdb_path = $postgresql::server::createdb_path
  $user          = $postgresql::server::user
  $group         = $postgresql::server::group
  $psql_path     = $postgresql::server::psql_path
  $default_db    = $postgresql::server::default_database

  # If possible use the version of the remote database, otherwise
  # fallback to our local DB version
  if $connect_settings != undef and has_key( $connect_settings, 'DBVERSION') {
    $version = $connect_settings['DBVERSION']
  } else {
    $version = $postgresql::server::_version
  }

  # If the connection settings do not contain a port, then use the local server port
  if $connect_settings != undef and has_key( $connect_settings, 'PGPORT') {
    $port = undef
  } else {
    $port = $postgresql::server::port
  }

  # Set the defaults for the postgresql_psql resource
  Postgresql_psql {
    psql_user        => $user,
    psql_group       => $group,
    psql_path        => $psql_path,
    port             => $port,
    connect_settings => $connect_settings,
  }

  # Optionally set the locale switch. Older versions of createdb may not accept
  # --locale, so if the parameter is undefined its safer not to pass it.
  if ($version != '8.1') {
    $locale_option = $locale ? {
      undef   => '',
      default => "LC_COLLATE='${locale}' LC_CTYPE='${locale}'",
    }
    $public_revoke_privilege = 'CONNECT'
  } else {
    $locale_option = ''
    $public_revoke_privilege = 'ALL'
  }

  $template_option = $template ? {
    undef   => '',
    default => "TEMPLATE=\"${template}\"",
  }

  $encoding_option = $encoding ? {
    undef   => '',
    default => "ENCODING='${encoding}'",
  }

  $tablespace_option = $tablespace ? {
    undef   => '',
    default => "TABLESPACE=\"${tablespace}\"",
  }

  if $createdb_path != undef{
    warning('Passing "createdb_path" to postgresql::database is deprecated, it can be removed safely for the same behaviour')
  }

  postgresql_psql { "Create db '${dbname}'":
    command => "CREATE DATABASE \"${dbname}\" WITH OWNER=\"${owner}\" ${template_option} ${encoding_option} ${locale_option} ${tablespace_option}",
    unless  => "SELECT datname FROM pg_database WHERE datname='${dbname}'",
    db      => $default_db,
    require => Class['postgresql::server::service']
  }~>

  # This will prevent users from connecting to the database unless they've been
  #  granted privileges.
  postgresql_psql {"REVOKE ${public_revoke_privilege} ON DATABASE \"${dbname}\" FROM public":
    db          => $default_db,
    refreshonly => true,
  }

  Postgresql_psql[ "Create db '${dbname}'" ]->
  postgresql_psql {"UPDATE pg_database SET datistemplate = ${istemplate} WHERE datname = '${dbname}'":
    unless => "SELECT datname FROM pg_database WHERE datname = '${dbname}' AND datistemplate = ${istemplate}",
    db     => $default_db,
  }

  if $comment {
    # The shobj_description function was only introduced with 8.2
    $comment_information_function =  $version ? {
      '8.1'   => 'obj_description',
      default => 'shobj_description',
    }
    Postgresql_psql[ "Create db '${dbname}'" ]->
    postgresql_psql {"COMMENT ON DATABASE \"${dbname}\" IS '${comment}'":
      unless => "SELECT pg_catalog.${comment_information_function}(d.oid, 'pg_database') as \"Description\" FROM pg_catalog.pg_database d WHERE datname = '${dbname}' AND pg_catalog.${comment_information_function}(d.oid, 'pg_database') = '${comment}'",
      db     => $dbname,
    }
  }

  # Build up dependencies on tablespace
  if($tablespace != undef and defined(Postgresql::Server::Tablespace[$tablespace])) {
    Postgresql::Server::Tablespace[$tablespace]->Postgresql_psql[ "Create db '${dbname}'" ]
  }
}
