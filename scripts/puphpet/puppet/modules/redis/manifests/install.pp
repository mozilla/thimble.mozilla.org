# = Class: redis::install
#
# This class installs the application.
#
class redis::install {
  if $::redis::manage_package {
    package { $::redis::package_name:
      ensure => $::redis::package_ensure,
    }
  }
}

