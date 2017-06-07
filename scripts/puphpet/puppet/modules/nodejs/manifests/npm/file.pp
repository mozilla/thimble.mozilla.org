# = Define: nodejs::npm::file
#
# Define that installs dependencies from a package file into a certain directory.
# NOTE: this is just a private definition and not meant for public usage.
#
# == Parameters:
#
# [*directory*]
#   Target directory.
#
# [*options*]
#   Options to adjust for the npm commands (optional).
#
# [*exec_user*]
#   User which should execute the command (optional).
#
# [*exec_env*]
#   Exec environment.
#
define nodejs::npm::file(
  $directory,
  $exec_user = undef,
  $exec_env  = undef,
  $options   = undef,
) {
  if $caller_module_name != $module_name {
    warning('::nodejs::npm::file is not meant for public use!')
  }

  exec { "npm_install_dir_${directory}":
    command     => "npm install ${options}",
    cwd         => $directory,
    path        => $::path,
    require     => Class['nodejs'],
    user        => $exec_user,
    environment => $exec_env,
  }
}
