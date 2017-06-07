class puphpet::php::repo::centos (
  $version
) {

  include ::yum::repo::remi

  ::yum::managed_yumrepo { "remi-php${version}":
    descr          => "Les RPM de remi pour Enterpise Linux \$releasever - \$basearch - PHP ${version}",
    mirrorlist     => "http://rpms.famillecollet.com/enterprise/\$releasever/php${version}/mirror",
    enabled        => 1,
    gpgcheck       => 1,
    gpgkey         => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-remi',
    gpgkey_source  => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-remi',
    priority       => 1,
  }

}
