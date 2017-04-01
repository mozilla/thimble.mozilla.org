# = Define: nodejs::npm::package
#
# Define that install a single package into a directory.
# NOTE: this is just a private definition and not meant for public usage.
#
# == Parameters:
#
# [*ensure*]
#   Whether to install or uninstall a npm module.
#
# [*version*]
#   The specific version of the package to install (optional).
#
# [*install_opt*]
#   Options to adjust for the npm commands (optional).
#
# [*remove_opt*]
#   Options to adjust for npm removal commands (optional).
#
# [*exec_user*]
#   User which should execute the command (optional).
#
# [*exec_env*]
#   Exec environment.
#
# [*npm_dir*]
#   Target directory.
#
# [*npm_pkg*]
#   Package name.
#
define nodejs::npm::package(
  $npm_dir,
  $npm_pkg,
  $ensure      = present,
  $version     = undef,
  $install_opt = undef,
  $remove_opt  = undef,
  $exec_user   = undef,
  $exec_env    = undef,
) {
  if $caller_module_name != $module_name {
    warning('::nodejs::npm::package is not meant for public use!')
  }

  $install_pkg = $version ? {
    undef   => $npm_pkg,
    default => "${npm_pkg}@${version}"
  }

  $validate = "${npm_dir}/node_modules/${npm_pkg}:${install_pkg}"

  if $ensure == present {
    exec { "npm_install_${npm_pkg}_${npm_dir}":
      command     => "npm install ${install_opt} ${install_pkg}",
      unless      => "npm list -p -l | grep '${validate}'",
      cwd         => $npm_dir,
      path        => $::path,
      require     => Class['nodejs'],
      user        => $exec_user,
      environment => $exec_env,
    }

    # Conditionally require npm_proxy only if resource exists.
    Exec<| title=='npm_proxy' |> -> Exec["npm_install_${npm_pkg}_${npm_dir}"]
  }
  else {
    exec { "npm_remove_${npm_pkg}_${npm_dir}":
      command     => "npm remove ${npm_pkg}",
      onlyif      => "npm list -p -l | grep '${validate}'",
      cwd         => $npm_dir,
      path        => $::path,
      require     => Class['nodejs'],
      user        => $exec_user,
      environment => $exec_env,
    }
  }
}
