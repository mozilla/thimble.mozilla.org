# = Class: yum::repo::puppetlabs_collections
#
# This class installs the puppetlabs-collections repo
#
class yum::repo::puppetlabs_collections (
  $baseurl    = '',
  $collection = '1',
  $priority   = 99,
) {
  $osver = $::operatingsystem ? {
    'XenServer' => [ '5' ],
    default     => split($::operatingsystemrelease, '[.]')
  }
  $release = $::operatingsystem ? {
    /(?i:Centos|RedHat|Scientific|CloudLinux|XenServer)/ => $osver[0],
    default                                              => '6',
  }

  $real_baseurl = $baseurl ? {
    ''      => "http://yum.puppetlabs.com/el/${release}/PC${collection}/\$basearch",
    default => $baseurl,
  }

  yum::managed_yumrepo { 'puppetlabs':
    descr          => 'Puppet Labs Puppet Collections',
    baseurl        => $real_baseurl,
    enabled        => 1,
    gpgcheck       => 1,
    failovermethod => 'priority',
    gpgkey         => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-puppetlabs',
    gpgkey_source  => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-puppetlabs',
    priority       => $priority,
  }

}
