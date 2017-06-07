# = Class: yum::repo::elasticsearch17
#
# This class installs the elasticsearch17 repo
#
class yum::repo::elasticsearch17 (
  $baseurl = 'http://packages.elasticsearch.org/elasticsearch/1.7/centos',
) {

  yum::managed_yumrepo { 'elasticsearch-1.7':
    descr         => 'Elasticsearch repository for 1.7.x packages',
    baseurl       => $baseurl,
    enabled       => 1,
    gpgcheck      => 1,
    gpgkey        => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-elasticsearch',
    gpgkey_source => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-elasticsearch',
  }

}
