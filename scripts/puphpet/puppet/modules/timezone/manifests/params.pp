# Class: timezone::params
#
# Defines all the variables used in the module.
#
class timezone::params {
  case $::osfamily {
    'Debian': {
      $package = 'tzdata'
      $zoneinfo_dir = '/usr/share/zoneinfo/'
      $localtime_file = '/etc/localtime'
      $timezone_file = '/etc/timezone'
      $timezone_file_template = 'timezone/timezone.erb'
      $timezone_file_supports_comment = false
      $timezone_update = 'dpkg-reconfigure -f noninteractive tzdata'
    }
    'RedHat', 'Linux': {
      $package = 'tzdata'
      $zoneinfo_dir = '/usr/share/zoneinfo/'
      $localtime_file = '/etc/localtime'
      case $::operatingsystemmajrelease {
        '7': {
          $timezone_file = false
        }
        default: {
          $timezone_file = '/etc/sysconfig/clock'
        }
      }
      $timezone_file_template = 'timezone/clock.erb'
      $timezone_update = false
    }
    'Gentoo': {
      $package = 'sys-libs/timezone-data'
      $zoneinfo_dir = '/usr/share/zoneinfo/'
      $localtime_file = '/etc/localtime'
      $timezone_file = '/etc/timezone'
      $timezone_file_template = 'timezone/timezone.erb'
      $timezone_file_supports_comment = true
      $timezone_update = 'emerge --config timezone-data'
    }
    'Archlinux': {
      $package = 'tzdata'
      $zoneinfo_dir = '/usr/share/zoneinfo/'
      $localtime_file = '/etc/localtime'
      $timezone_file = false
      $timezone_update = 'timedatectl set-timezone '
    }
    'Suse': {
      $package = 'timezone'
      $zoneinfo_dir = '/usr/share/zoneinfo/'
      $localtime_file = '/etc/localtime'
      $timezone_file = false
      $timezone_update = 'zic -l '
    }
    'FreeBSD': {
      $package      = undef
      $zoneinfo_dir = '/usr/share/zoneinfo/'
      $localtime_file = '/etc/localtime'
      $timezone_file = false
    }
    default: {
      case $::operatingsystem {
        default: {
          fail("Unsupported platform: ${::osfamily}/${::operatingsystem}")
        }
      }
    }
  }
}
