# = Class: yum::repo::pdgd94
#
# This class installs the postgresql 9.4 repo
#
class yum::repo::pgdg94 {
  yum::managed_yumrepo { 'pgdg94':
    descr         => 'PostgreSQL 9.4 $releasever - $basearch',
    baseurl       => 'http://yum.postgresql.org/9.4/redhat/rhel-$releasever-$basearch',
    enabled       => 1,
    gpgcheck      => 1,
    gpgkey        => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-PGDG',
    gpgkey_source => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-PGDG',
    priority      => 20,
  }
}
