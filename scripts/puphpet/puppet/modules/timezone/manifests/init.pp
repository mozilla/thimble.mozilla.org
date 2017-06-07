# Class: timezone
#
# This module manages timezone settings
#
# Parameters:
#   [*timezone*]
#     The name of the timezone.
#     Default: UTC
#
#   [*ensure*]
#     Ensure if present or absent.
#     Default: present
#
#   [*autoupgrade*]
#     Upgrade package automatically, if there is a newer version.
#     Default: false
#
#   [*package*]
#     Name of the package.
#     Only set this, if your platform is not supported or you know, what you're doing.
#     Default: auto-set, platform specific
#
#   [*config_file*]
#     Main configuration file.
#     Only set this, if your platform is not supported or you know, what you're doing.
#     Default: auto-set, platform specific
#
#   [*zoneinfo_dir*]
#     Source directory of zoneinfo files.
#     Only set this, if your platform is not supported or you know, what you're doing.
#     Default: auto-set, platform specific
#
#   [*hwutc*]
#     Is the hardware clock set to UTC? (true or false)
#     Default: undefined
#
# Actions:
#   Installs tzdata and configures timezone
#
# Requires:
#   Nothing
#
# Sample Usage:
#   class { 'timezone':
#     timezone => 'Europe/Berlin',
#   }
#
# [Remember: No empty lines between comments and class definition]
class timezone (
  $ensure = 'present',
  $timezone = 'UTC',
  $hwutc = '',
  $autoupgrade = false
) inherits timezone::params {

  validate_bool($autoupgrade)

  case $ensure {
    /(present)/: {
      if $autoupgrade == true {
        $package_ensure = 'latest'
      } else {
        $package_ensure = 'present'
      }
      $localtime_ensure = 'link'
      $timezone_ensure = 'file'
    }
    /(absent)/: {
      # Leave package installed, as it is a system dependency
      $package_ensure = 'present'
      $localtime_ensure = 'absent'
      $timezone_ensure = 'absent'
    }
    default: {
      fail('ensure parameter must be present or absent')
    }
  }

  if $timezone::params::package {
    package { $timezone::params::package:
      ensure => $package_ensure,
      before => File[$timezone::params::localtime_file],
    }
  }

  if $timezone::params::timezone_file != false {
    file { $timezone::params::timezone_file:
      ensure  => $timezone_ensure,
      content => template($timezone::params::timezone_file_template),
    }
    if $ensure == 'present' and $timezone::params::timezone_update {
      $e_command = $::osfamily ? {
        /(Suse|Archlinux)/ => "${timezone::params::timezone_update} ${timezone}",
        default            => $timezone::params::timezone_update
      }
      exec { 'update_timezone':
        command     => $e_command,
        path        => '/usr/bin:/usr/sbin:/bin:/sbin',
        subscribe   => File[$timezone::params::timezone_file],
        refreshonly => true,
      }
    }
  }

  file { $timezone::params::localtime_file:
    ensure => $localtime_ensure,
    target => "${timezone::params::zoneinfo_dir}${timezone}",
  }
}
