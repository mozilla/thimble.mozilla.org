# = Class: yum::repo::openshift-server
#
# This class installs the openshift-server repo for CentOS6
# Used for puppet-openshift_origin (https://github.com/openshift/puppet-openshift_origin)
# when setting 'install_method' to 'none' in addition with 'yum::repo::epel' and 'yum::repo::jenkins' 
#
class yum::repo::openshift_server ($version=4) {
  if $::operatingsystemrelease !~ /^6/ {
    warning('The module \'Yum::Repo::Openshift-server\' works only for RHEL6')
  }
  yum::managed_yumrepo { 'openshift-origin':
    descr          => 'Openshift Origin',
    baseurl        => "https://mirror.openshift.com/pub/origin-server/release/${version}/rhel-6/packages/${::architecture}",
    enabled        => 1,
    gpgcheck       => 0,
    failovermethod => 'priority',
    priority       => 1,
    mirrorlist     => absent,
    require        => Package['yum-plugin-priorities'],
  }

  yum::managed_yumrepo { 'openshift-deps':
    descr          => 'Openshift Dependencies',
    baseurl        => "https://mirror.openshift.com/pub/origin-server/release/${version}/rhel-6/dependencies/${::architecture}",
    enabled        => 1,
    gpgcheck       => 0,
    failovermethod => 'priority',
    priority       => 1,
    mirrorlist     => absent,
    require        => Package['yum-plugin-priorities'],
  }
}
