# == Class: elasticsearch::package::pin
#
# Controls package pinning for the Elasticsearch package.
#
# === Parameters
#
# This class does not provide any parameters.
#
# === Examples
#
# This class may be imported by other classes to use its functionality:
#   class { 'elasticsearch::package::pin': }
#
# It is not intended to be used directly by external resources like node
# definitions or other modules.
#
# === Authors
#
# * Tyler Langlois <mailto:tyler@elastic.co>
#
class elasticsearch::package::pin {

  Exec {
    path => [ '/bin', '/usr/bin', '/usr/local/bin' ],
    cwd  => '/',
  }

  case $::osfamily {
    'Debian': {
      include ::apt

      if ($elasticsearch::ensure == 'absent') {
        apt::pin { $elasticsearch::package_name:
          ensure => $elasticsearch::ensure,
        }
      } elsif ($elasticsearch::version != false) {
        apt::pin { $elasticsearch::package_name:
          ensure   => $elasticsearch::ensure,
          packages => $elasticsearch::package_name,
          version  => $elasticsearch::version,
          priority => 1000,
        }
      }

    }
    'RedHat', 'Linux': {

      if ($elasticsearch::ensure == 'absent') {
        $_versionlock = '/etc/yum/pluginconf.d/versionlock.list'
        $_lock_line = '0:elasticsearch-'
        exec { 'elasticsearch_purge_versionlock.list':
          command => "sed -i '/${_lock_line}/d' ${_versionlock}",
          onlyif  => [
            "test -f ${_versionlock}",
            "grep -F '${_lock_line}' ${_versionlock}",
          ],
        }
      } elsif ($elasticsearch::version != false) {
        yum::versionlock {
          "0:elasticsearch-${elasticsearch::pkg_version}.noarch":
            ensure => $elasticsearch::ensure,
        }
      }

    }
    default: {
      warning("Unable to pin package for OSfamily \"${::osfamily}\".")
    }
  }
}
