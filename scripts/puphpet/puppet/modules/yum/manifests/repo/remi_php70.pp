# = Class: yum::repo::remi_php70
#
# This class installs the remi-php70 repo
#
class yum::repo::remi_php70 {
  yum::managed_yumrepo { 'remi-php70':
    descr         => 'Remi\'s PHP 7.0 RPM repository for Enterprise Linux 7 - $basearch',
    mirrorlist    => 'http://rpms.remirepo.net/enterprise/7/php70/mirror',
    enabled       => 1,
    gpgcheck      => 1,
    gpgkey        => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-remi',
    gpgkey_source => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-remi',
    priority      => 1,
  }

  yum::managed_yumrepo { 'remi-php70-debuginfo':
    descr         => 'Remi\'s PHP 7.0 RPM repository for Enterprise Linux 7 - $basearch - debuginfo',
    baseurl       => 'http://rpms.remirepo.net/enterprise/7/debug-php70/$basearch/',
    enabled       => 0,
    gpgcheck      => 1,
    gpgkey        => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-remi',
    gpgkey_source => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-remi',
  }
}
