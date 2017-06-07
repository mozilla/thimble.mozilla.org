include ::archive

archive { '/tmp/jre-8u71':
  source => 'http://download.oracle.com/otn-pub/java/jdk/7u71-b14/jre-7u71-windows-x64.exe',
  cookie => 'oraclelicense=accept-securebackup-cookie',
}
