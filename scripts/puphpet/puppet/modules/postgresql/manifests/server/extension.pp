# Activate an extension on a postgresql database
define postgresql::server::extension (
  $database,
  $extension = $name,
  $ensure = 'present',
  $package_name = undef,
  $package_ensure = undef,
  $connect_settings = $postgresql::server::default_connect_settings,
) {
  $user          = $postgresql::server::user
  $group         = $postgresql::server::group
  $psql_path     = $postgresql::server::psql_path

  case $ensure {
    'present': {
      $command = "CREATE EXTENSION \"${extension}\""
      $unless_comp = '='
      $package_require = []
      $package_before = Postgresql_psql["Add ${extension} extension to ${database}"]
    }

    'absent': {
      $command = "DROP EXTENSION \"${extension}\""
      $unless_comp = '!='
      $package_require = Postgresql_psql["Add ${extension} extension to ${database}"]
      $package_before = []
    }

    default: {
      fail("Unknown value for ensure '${ensure}'.")
    }
  }


  postgresql_psql {"Add ${extension} extension to ${database}":

    psql_user        => $user,
    psql_group       => $group,
    psql_path        => $psql_path,
    connect_settings => $connect_settings,

    db               => $database,
    command          => $command,
    unless           => "SELECT t.count FROM (SELECT count(extname) FROM pg_extension WHERE extname = '${extension}') as t WHERE t.count ${unless_comp} 1",
    require          => Postgresql::Server::Database[$database],
  }

  if $package_name {
    $_package_ensure = $package_ensure ? {
      undef   => $ensure,
      default => $package_ensure,
    }

    ensure_packages($package_name, {
      ensure  => $_package_ensure,
      tag     => 'postgresql',
      require => $package_require,
      before  => $package_before,
    })
  }
}
