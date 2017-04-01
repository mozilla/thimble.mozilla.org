# = Class: yum::repo::logstash13
#
# This class installs the logstash13 repo
#
class yum::repo::logstash13 (
  $baseurl = 'http://packages.elasticsearch.org/logstash/1.3/centos',
) {

  yum::managed_yumrepo { 'logstash-1.3':
    descr         => 'logstash repository for 1.3.x packages',
    baseurl       => $baseurl,
    enabled       => 1,
    gpgcheck      => 1,
    gpgkey        => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-elasticsearch',
    gpgkey_source => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-elasticsearch',
  }

}
