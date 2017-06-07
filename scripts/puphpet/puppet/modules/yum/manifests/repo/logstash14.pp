# = Class: yum::repo::logstash14
#
# This class installs the logstash14 repo
#
class yum::repo::logstash14 (
  $baseurl = 'http://packages.elasticsearch.org/logstash/1.4/centos',
) {

  yum::managed_yumrepo { 'logstash-1.4':
    descr         => 'logstash repository for 1.4.x packages',
    baseurl       => $baseurl,
    enabled       => 1,
    gpgcheck      => 1,
    gpgkey        => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-elasticsearch',
    gpgkey_source => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-elasticsearch',
  }

}
