# = Class: yum::repo::tengen
#
# This class installs the tengen repo for MongoDB
#
class yum::repo::tengen (
  $baseurl = "http://downloads-distro.mongodb.org/repo/redhat/os/${::architecture}",
) {
  yum::managed_yumrepo { 'tengen':
    descr    => 'tengen Repository',
    baseurl  => $baseurl,
    enabled  => 1,
    gpgcheck => 0,
  }
}
