# = Define: nodejs::npm
#
# Define to install packages in a certain directory.
#
# == Parameters:
#
# [*ensure*]
#   Whether to install or uninstall the package.
#
# [*version*]
#   The specific version of the package to install (optional).
#
# [*source*]
#   [DEPRECATED] Parameter to adjust a certain package name.
#
# [*install_opt*]
#   Options to adjust for the npm commands (optional).
#
# [*remove_opt*]
#   Options to adjust for npm removal commands (optional).
#
# [*exec_as_user*]
#   User which should execute the command (optional).
#
# [*list*]
#   Whehter to apply a package.json or installing a custom package (default: false).
#
# [*directory*]
#   Target directory.
#
# [*pkg_name*]
#   Package name.
#
# == Example:
#
# Single package:
#
#   ::nodejs::npm { 'webpack-directory':
#     ensure => present,
#     version => 'x.x',
#     pkg_name => 'webpack',
#     directory => '/directory',
#   }
#
# From package.json:
#
#   ::nodejs::npm { 'directory-npm-install':
#     list => true,
#     directory => '/directory',
#   }
#
define nodejs::npm (
  $ensure       = present,
  $version      = undef,
  $source       = undef,
  $install_opt  = undef,
  $remove_opt   = undef,
  $exec_as_user = undef,
  $list         = false,
  $directory    = undef,
  $pkg_name     = undef,
) {
  include nodejs

  if $exec_as_user == undef {
    $exec_env = undef
  } else {
    # if exec user is defined, exec environment depends on the operating system
    case $::operatingsystem {
      'Debian', 'Ubuntu', 'RedHat', 'SLES', 'Fedora', 'CentOS': {
        $exec_env = "HOME=/home/${exec_as_user}"
      }
      default: {
        # so far only linux systems are supported with this option
        fail("This feature does not support the operating system '${::operatingsystem}'!")
      }
    }
  }

  if $list {
    if $remove_opt != undef {
      fail('Remove options cannot be applied for an install from directory!')
    }

    ::nodejs::npm::file { "npm-install-dir-${directory}":
      directory => $directory,
      exec_user => $exec_as_user,
      exec_env  => $exec_env,
      options   => $install_opt,
    }
  }
  else {
    $npm = split($name, ':')
    if $directory == undef and $pkg_name == undef and $source == undef and $npm[0] and $npm[1] {
      warning('It is deprecated to pass the target directory and the package as resource name. Use "$directory" and "$pkg_name instead!')

      $npm_dir = $npm[0]
      $npm_pkg = $npm[1]
    }
    else {
      $npm_dir = $directory

      if $source != undef and $pkg_name == undef {
        warning('It is deprecated to use the "$source" parameter. Use "$pkg_name" instead!')
        $npm_pkg = $source
      }
      else {
        $npm_pkg = $pkg_name
      }
    }

    ::nodejs::npm::package { "npm-install-${npm_pkg}-${npm_dir}":
      ensure      => $ensure,
      remove_opt  => $remove_opt,
      exec_user   => $exec_as_user,
      npm_dir     => $npm_dir,
      npm_pkg     => $npm_pkg,
      version     => $version,
      exec_env    => $exec_env,
      install_opt => $install_opt,
    }
  }
}
