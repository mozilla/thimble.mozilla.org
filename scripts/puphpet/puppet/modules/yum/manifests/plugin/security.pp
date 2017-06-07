# = Class yum::plugin::security
#
#
class yum::plugin::security ($ensure = present) {

  package {
    'yum-plugin-security':
      ensure => $ensure
  }
}
