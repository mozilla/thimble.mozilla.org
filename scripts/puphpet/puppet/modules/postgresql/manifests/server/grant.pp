# Define for granting permissions to roles. See README.md for more details.
define postgresql::server::grant (
  $role,
  $db,
  $privilege        = undef,
  $object_type      = 'database',
  $object_name      = undef,
  $psql_db          = $postgresql::server::default_database,
  $psql_user        = $postgresql::server::user,
  $port             = $postgresql::server::port,
  $onlyif_exists    = false,
  $connect_settings = $postgresql::server::default_connect_settings,
) {
  $group     = $postgresql::server::group
  $psql_path = $postgresql::server::psql_path

  if ! $object_name {
    $_object_name = $db
  } else {
    $_object_name = $object_name
  }

  validate_bool($onlyif_exists)
  #
  # Port, order of precedence: $port parameter, $connect_settings[PGPORT], $postgresql::server::port
  #
  if $port != undef {
    $port_override = $port
  } elsif $connect_settings != undef and has_key( $connect_settings, 'PGPORT') {
    $port_override = undef
  } else {
    $port_override = $postgresql::server::port
  }

  ## Munge the input values
  $_object_type = upcase($object_type)
  $_privilege   = upcase($privilege)

  ## Validate that the object type is known
  validate_string($_object_type,
    #'COLUMN',
    'DATABASE',
    #'FOREIGN SERVER',
    #'FOREIGN DATA WRAPPER',
    #'FUNCTION',
    #'PROCEDURAL LANGUAGE',
    'SCHEMA',
    'SEQUENCE',
    'ALL SEQUENCES IN SCHEMA',
    'TABLE',
    'ALL TABLES IN SCHEMA',
    #'TABLESPACE',
    #'VIEW',
  )
  # You can use ALL TABLES IN SCHEMA by passing schema_name to object_name
  # You can use ALL SEQUENCES IN SCHEMA by passing schema_name to object_name

  ## Validate that the object type's privilege is acceptable
  # TODO: this is a terrible hack; if they pass "ALL" as the desired privilege,
  #  we need a way to test for it--and has_database_privilege does not
  #  recognize 'ALL' as a valid privilege name. So we probably need to
  #  hard-code a mapping between 'ALL' and the list of actual privileges that
  #  it entails, and loop over them to check them.  That sort of thing will
  #  probably need to wait until we port this over to ruby, so, for now, we're
  #  just going to assume that if they have "CREATE" privileges on a database,
  #  then they have "ALL".  (I told you that it was terrible!)
  case $_object_type {
    'DATABASE': {
      $unless_privilege = $_privilege ? {
        'ALL'            => 'CREATE',
        'ALL PRIVILEGES' => 'CREATE',
        default          => $_privilege,
      }
      validate_string($unless_privilege,'CREATE','CONNECT','TEMPORARY','TEMP',
        'ALL','ALL PRIVILEGES')
      $unless_function = 'has_database_privilege'
      $on_db = $psql_db
      $onlyif_function = undef
    }
    'SCHEMA': {
      $unless_privilege = $_privilege ? {
        'ALL'            => 'CREATE',
        'ALL PRIVILEGES' => 'CREATE',
        default          => $_privilege,
      }
      validate_string($_privilege, 'CREATE', 'USAGE', 'ALL', 'ALL PRIVILEGES')
      $unless_function = 'has_schema_privilege'
      $on_db = $db
      $onlyif_function = undef
    }
    'SEQUENCE': {
      $unless_privilege = $_privilege ? {
        'ALL'   => 'USAGE',
        default => $_privilege,
      }
      validate_string($unless_privilege,'USAGE','ALL','ALL PRIVILEGES')
      $unless_function = 'has_sequence_privilege'
      $on_db = $db
      $onlyif_function = undef
    }
    'ALL SEQUENCES IN SCHEMA': {
      validate_string($_privilege,'USAGE','ALL','ALL PRIVILEGES')
      $unless_function = 'custom'
      $on_db = $db
      $onlyif_function = undef

      $schema = $object_name

      $custom_privilege = $_privilege ? {
        'ALL'            => 'USAGE',
        'ALL PRIVILEGES' => 'USAGE',
        default          => $_privilege,
      }

      # This checks if there is a difference between the sequences in the
      # specified schema and the sequences for which the role has the specified
      # privilege. It uses the EXCEPT clause which computes the set of rows
      # that are in the result of the first SELECT statement but not in the
      # result of the second one. It then counts the number of rows from this
      # operation. If this number is zero then the role has the specified
      # privilege for all sequences in the schema and the whole query returns a
      # single row, which satisfies the `unless` parameter of Postgresql_psql.
      # If this number is not zero then there is at least one sequence for which
      # the role does not have the specified privilege, making it necessary to
      # execute the GRANT statement.
      $custom_unless = "SELECT 1 FROM (
        SELECT sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema='${schema}'
          EXCEPT DISTINCT
        SELECT object_name as sequence_name
        FROM information_schema.role_usage_grants
        WHERE object_type='SEQUENCE'
        AND grantee='${role}'
        AND object_schema='${schema}'
        AND privilege_type='${custom_privilege}'
        ) P
        HAVING count(P.sequence_name) = 0"
    }
    'TABLE': {
      $unless_privilege = $_privilege ? {
        'ALL'   => 'INSERT',
        default => $_privilege,
      }
      validate_string($unless_privilege,'SELECT','INSERT','UPDATE','DELETE',
        'TRUNCATE','REFERENCES','TRIGGER','ALL','ALL PRIVILEGES')
      $unless_function = 'has_table_privilege'
      $on_db = $db
      $onlyif_function = $onlyif_exists ? {
        true    => 'table_exists',
        default => undef,
      }
    }
    'ALL TABLES IN SCHEMA': {
      validate_string($_privilege,'SELECT','INSERT','UPDATE','DELETE',
        'TRUNCATE','REFERENCES','TRIGGER','ALL','ALL PRIVILEGES')
      $unless_function = 'custom'
      $on_db = $db
      $onlyif_function = undef

      $schema = $object_name

      # Again there seems to be no easy way in plain SQL to check if ALL
      # PRIVILEGES are granted on a table. By convention we use INSERT
      # here to represent ALL PRIVILEGES (truly terrible).
      $custom_privilege = $_privilege ? {
        'ALL'            => 'INSERT',
        'ALL PRIVILEGES' => 'INSERT',
        default          => $_privilege,
      }

      # This checks if there is a difference between the tables in the
      # specified schema and the tables for which the role has the specified
      # privilege. It uses the EXCEPT clause which computes the set of rows
      # that are in the result of the first SELECT statement but not in the
      # result of the second one. It then counts the number of rows from this
      # operation. If this number is zero then the role has the specified
      # privilege for all tables in the schema and the whole query returns a
      # single row, which satisfies the `unless` parameter of Postgresql_psql.
      # If this number is not zero then there is at least one table for which
      # the role does not have the specified privilege, making it necessary to
      # execute the GRANT statement.
      $custom_unless = "SELECT 1 FROM (
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='${schema}'
          EXCEPT DISTINCT
        SELECT table_name
        FROM information_schema.role_table_grants
        WHERE grantee='${role}'
        AND table_schema='${schema}'
        AND privilege_type='${custom_privilege}'
        ) P
        HAVING count(P.table_name) = 0"
    }
    default: {
      fail("Missing privilege validation for object type ${_object_type}")
    }
  }

  # This is used to give grant to "schemaname"."tablename"
  # If you need such grant, use:
  # postgresql::grant { 'table:foo':
  #   role        => 'joe',
  #   ...
  #   object_type => 'TABLE',
  #   object_name => [$schema, $table],
  # }
  if is_array($_object_name) {
    $_togrant_object = join($_object_name, '"."')
    # Never put double quotes into has_*_privilege function
    $_granted_object = join($_object_name, '.')
  } else {
    $_granted_object = $_object_name
    $_togrant_object = $_object_name
  }

  $_unless = $unless_function ? {
      false    => undef,
      'custom' => $custom_unless,
      default  => "SELECT 1 WHERE ${unless_function}('${role}',
                  '${_granted_object}', '${unless_privilege}')",
  }

  $_onlyif = $onlyif_function ? {
    'table_exists' => "SELECT true FROM pg_tables WHERE tablename = '${_togrant_object}'",
    default        => undef,
  }

  $grant_cmd = "GRANT ${_privilege} ON ${_object_type} \"${_togrant_object}\" TO
      \"${role}\""
  postgresql_psql { "grant:${name}":
    command          => $grant_cmd,
    db               => $on_db,
    port             => $port_override,
    connect_settings => $connect_settings,
    psql_user        => $psql_user,
    psql_group       => $group,
    psql_path        => $psql_path,
    unless           => $_unless,
    onlyif           => $_onlyif,
    require          => Class['postgresql::server']
  }

  if($role != undef and defined(Postgresql::Server::Role[$role])) {
    Postgresql::Server::Role[$role]->Postgresql_psql["grant:${name}"]
  }

  if($db != undef and defined(Postgresql::Server::Database[$db])) {
    Postgresql::Server::Database[$db]->Postgresql_psql["grant:${name}"]
  }
}
