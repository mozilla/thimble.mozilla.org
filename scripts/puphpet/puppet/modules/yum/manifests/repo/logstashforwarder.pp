# = Class: yum::repo::logstashforwarder
#
# This class installs the logstashforwarder (former lumberjack) repo.
#
class yum::repo::logstashforwarder (
  $baseurl = 'http://packages.elasticsearch.org/logstashforwarder/centos',
) {

  yum::managed_yumrepo { 'logstashfowarder':
    descr         => 'logstashforwarder repository for logstashforwarder packages',
    baseurl       => $baseurl,
    enabled       => 1,
    gpgcheck      => 1,
    gpgkey        => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-elasticsearch',
    gpgkey_source => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-elasticsearch',
  }

}
