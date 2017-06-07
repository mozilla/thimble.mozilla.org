# = Class: yum::repo::esl
#
# This class installs the esl repo
#
class yum::repo::esl (
  $baseurl = 'http://packages.erlang-solutions.com/rpm/centos/$releasever/$basearch',
) {

  yum::managed_yumrepo { 'esl':
    descr         => 'Erlang Solutions',
    baseurl       => $baseurl,
    enabled       => 1,
    gpgcheck      => 0,
    gpgkey        => 'file:///etc/pki/rpm-gpg/RPM-GPG-KEY-erlang_solutions',
    gpgkey_source => 'puppet:///modules/yum/rpm-gpg/RPM-GPG-KEY-elasticsearch',
    priority      => 10,
  }

}
