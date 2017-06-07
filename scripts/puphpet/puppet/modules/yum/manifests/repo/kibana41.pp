# = Class: yum::repo::kibana41
#
# This class installs the kibana41 repo
#
class yum::repo::kibana41 (
  $baseurl = 'http://packages.elasticsearch.org/kibana/4.1/centos',
) {

  yum::managed_yumrepo { 'kibana-4.1':
    descr         => 'Elasticsearch repository for kibana 4.1',
    baseurl       => $baseurl,
    enabled       => 1,
    gpgcheck      => 1,
    gpgkey        => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-elasticsearch',
    gpgkey_source => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-elasticsearch',
  }

}
