# = Class: yum::repo::cloudflare
#
# This class installs the cloudflare repo for railgun installation
#
class yum::repo::cloudflare {
  yum::managed_yumrepo { 'cloudflare':
    descr          => 'CloudFlare Packages',
    baseurl        => 'http://pkg.cloudflare.com/dists/$releasever/main/binary-$basearch',
    enabled        => 1,
    gpgcheck       => 1,
    failovermethod => 'priority',
    gpgkey         => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-CLOUDFLARE-2',
    gpgkey_source  => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-CLOUDFLARE-2',
    priority       => 1,
  }
}
