# = Class: yum::repo::icinga
#
# This class installs the icinga repo
#
class yum::repo::icinga (
  $baseurl = 'http://packages.icinga.org/epel/$releasever/release/',
) {

  yum::managed_yumrepo { 'icinga':
    descr          => 'ICINGA (stable release for epel)',
    baseurl        => $baseurl,
    enabled        => 1,
    gpgcheck       => 1,
    gpgkey         => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-icinga',
    gpgkey_source  => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-icinga',
    priority       => 1,
    failovermethod => 'priority',
  }

}
