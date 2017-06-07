# = Class: yum::repo::scl
#
# This class installs the scl ruby200 repo
#
class yum::repo::sclruby200 (
  $baseurl = ''
) {

  $osver = split($::operatingsystemrelease, '[.]')
  $release = $::operatingsystem ? {
    /(?i:Centos|RedHat|Scientific)/ => $osver[0],
    default                         => '6',
  }

  $real_baseurl = $baseurl ? {
    ''      => "https://www.softwarecollections.org/repos/rhscl/ruby200/epel-${release}-\$basearch/",
    default => $baseurl,
  }

  yum::managed_yumrepo { 'scl-ruby200':
    descr          => 'CentOS-$releasever - SCL Ruby200',
    baseurl        => $real_baseurl,
    enabled        => 1,
    gpgcheck       => 0,
    priority       => 20,
    failovermethod => 'priority',
  }

}
