#
# This class installs the devtools2 repo
#
class yum::repo::devtools2 (
  $baseurl = 'http://people.centos.org/tru/devtools-2/$releasever/$basearch/RPMS'
) {

  require yum

  yum::managed_yumrepo { 'devtools2':
    descr    => 'Devtools2 for CentOS',
    baseurl  => $baseurl,
    enabled  => 1,
    gpgcheck => 0,
    priority => 90,
  }
}
