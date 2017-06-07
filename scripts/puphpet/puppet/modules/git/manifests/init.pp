# Class: git
#
# This class installs and configures git
#
# Actions:
#   - Install the git package
#   - Configure git
#
# Sample Usage:
#  class { 'git': }
#
# === Parameters
#
# [*package_ensure*]
#   Value to be passed to ensure in the package resource. Defaults to installed.
#
# [*package_manage*]
#   boolean toggle to overide the management of the git package.
#   You may want to change this behavior if another module manages git packages
#   defaults to true
#
# [*configs*]
#   hash of configurations as per the git::config defined type
#
# [*configs_defaults*]
#   hash of configuration defaults as per the git::config defined type
#   to use for every *configs* item
#
class git (
  $package_name   = 'git',
  $package_ensure = 'installed',
  $package_manage = true,
  $configs = {},
  $configs_defaults = {}
) {
  if ( $package_manage ) {
    package { $package_name:
      ensure => $package_ensure,
    }
  }

  create_resources(git::config, git_config_hash($configs), $configs_defaults)
}
