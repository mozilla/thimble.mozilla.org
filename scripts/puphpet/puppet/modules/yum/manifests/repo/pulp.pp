# = Class: yum::repo::pulp
#
# This class installs the pulp repo for CentOS7
#
class yum::repo::pulp {
  if $::operatingsystemmajrelease !~ /^(5|6|7)$/ {
    warning('The module \'Yum::Repo::Pulp\' works only for RHEL 5,6 and 7.')
  }

  yum::managed_yumrepo { 'pulp-2-stable':
    descr          => 'Pulp 2 Production Releases',
    baseurl        => "https://repos.fedorapeople.org/repos/pulp/pulp/stable/2/${::operatingsystemmajrelease}/${::architecture}/",
    enabled        => 1,
    gpgcheck       => 1,
    gpgkey         => 'https://repos.fedorapeople.org/repos/pulp/pulp/GPG-RPM-KEY-pulp-2',
    failovermethod => 'priority',
    priority       => 10,
    mirrorlist     => absent,
  }
}
