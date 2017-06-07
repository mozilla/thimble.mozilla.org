# = Class: yum::repo::shibboleth
#
# This class installs the shibboleth repo
#
class yum::repo::shibboleth {
  yum::managed_yumrepo { 'shibboleth':
    descr          => 'Shibboleth yum repository',
    baseurl        => 'http://download.opensuse.org/repositories/security:/shibboleth/CentOS_$releasever/',
    enabled        => 1,
    gpgcheck       => 0,
    failovermethod => 'priority',
    priority       => 1,
  }
}
