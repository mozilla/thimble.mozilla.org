# = Class: yum::repo::openshift3
#
# This class installs the openshift3 repo
#
class yum::repo::openshift3 {
  yum::managed_yumrepo { 'openshift3':
    descr          => 'RedHat Openshift 3 $basearch repo',
    baseurl        => 'https://mirror.openshift.com/pub/openshift-v3/dependencies/centos7/$basearch/',
    enabled        => 1,
    gpgcheck       => 0,
    failovermethod => 'priority',
    priority       => 1,
  }
}
