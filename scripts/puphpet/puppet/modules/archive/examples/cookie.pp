archive { '/tmp/jdk-7u80-linux-x64.tar.gz':
  source   => 'http://download.oracle.com/otn-pub/java/jdk/7u80-b15/jdk-7u80-linux-x64.tar.gz',
  cookie   => 'oraclelicense=accept-securebackup-cookie',
  provider => 'wget',
}
