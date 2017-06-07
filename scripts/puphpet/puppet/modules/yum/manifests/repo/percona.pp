# = Class: yum::repo::percona
#
# This class installs the Percona RPM Repository
#
class yum::repo::percona {
  yum::managed_yumrepo { 'percona':
    descr          => 'Percona RPM Repository (http://www.percona.com/percona-lab.html)',
    baseurl        => 'http://repo.percona.com/centos/$releasever/os/$basearch/',
    enabled        => 1,
    gpgcheck       => 1,
    failovermethod => 'priority',
    gpgkey         => 'http://www.percona.com/downloads/RPM-GPG-KEY-percona',
    priority       => 1,
  }
}