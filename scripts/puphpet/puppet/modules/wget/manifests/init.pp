################################################################################
# Class: wget
#
# This class will install wget - a tool used to download content from the web.
#
################################################################################
class wget (
  $version = present,
  $manage_package = true,
) {

  if $manage_package {
    if $::kernel == 'Linux' {
      if ! defined(Package['wget']) {
        package { 'wget': ensure => $version }
      }
    }
  
    if $::kernel == 'FreeBSD' {
      if ! defined(Package['ftp/wget']) {
        package { 'ftp/wget': ensure => $version }
      }
    }
  }
}
