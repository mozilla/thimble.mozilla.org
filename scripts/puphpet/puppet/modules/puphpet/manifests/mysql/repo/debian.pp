class puphpet::mysql::repo::debian (
  $version = $::puphpet::mysql::params::version
) {

  $os = downcase($::operatingsystem)

  if $version in ['56', '5.6'] {
    ::apt::pin { 'repo.mysql.com-apt':
      priority   => 1000,
      originator => 'repo.mysql.com-apt',
    }

    if ! defined(Apt::Source['repo.mysql.com-apt']) {
      ::apt::source { 'repo.mysql.com-apt':
        location => "http://repo.mysql.com/apt/${os}",
        release  => $::lsbdistcodename,
        repos    => 'mysql-5.6',
        include  => { 'src' => true },
        require  => Apt::Pin['repo.mysql.com-apt'],
        before   => [
          Class['mysql::client'],
          Class['mysql::server'],
        ],
      }
    }
  }

  if $version in ['57', '5.7'] {
    ::apt::pin { 'repo.mysql.com-apt':
      priority   => 1000,
      originator => 'repo.mysql.com-apt',
    }

    if ! defined(Apt::Source['repo.mysql.com-apt']) {
      apt::source { 'repo.mysql.com-apt':
        location => "http://repo.mysql.com/apt/${os}",
        release  => $::lsbdistcodename,
        repos    => 'mysql-5.7',
        include  => { 'src' => true },
        require  => Apt::Pin['repo.mysql.com-apt'],
        before   => [
          Class['mysql::client'],
          Class['mysql::server'],
        ],
      }
    }
  }

}
