# Class: php::pear
#
# Installs Pear for PHP module
#
# Usage:
# include php::pear
#
# == Parameters
#
# Standard class parameters
# Define the general class behaviour and customizations
#
# [*package*]
#   Name of the package to install. Defaults to 'php-pear'
#
# [*version*]
#   Version to install. Defaults to 'present'
#
# [*install_package*]
#   Boolean. Determines if any package should be installed to support the PEAR functionality.
#   Can be false if PEAR was already provided by another package or module.
#   Default: true
#
# [*install_options*]
#   An array of package manager install options. See $php::install_options
#
class php::pear (
  $package         = $php::package_pear,
  $install_package = true,
  $install_options = [],
  $version         = 'present',
  $path            = '/usr/bin:/usr/sbin:/bin:/sbin'
  ) inherits php {

  $real_install_options = $install_options ? {
    ''      => $php::install_options,
    default => $install_options,
  }

  if ( $install_package ) {
    package { 'php-pear':
      ensure          => $version,
      name            => $package,
      install_options => $real_install_options,
    }
  }

}
