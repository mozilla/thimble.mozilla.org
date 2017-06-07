class puphpet::mysql::repo::centos (
  $version = $::puphpet::mysql::params::version
) {

  if $version in ['56', '5.6'] {
    class { 'yum::repo::mysql_community':
      enabled_version => '5.6',
      before          => [
        Class['mysql::client'],
        Class['mysql::server'],
      ],
    }
  }

  if $version in ['57', '5.7'] {
    class { 'yum::repo::mysql_community':
      enabled_version => '5.7',
      before          => [
        Class['mysql::client'],
        Class['mysql::server'],
      ],
    }
  }

}
