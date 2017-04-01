include '::archive'

archive { '/tmp/jta-1.1.jar':
  ensure        => present,
  extract       => true,
  extract_path  => '/tmp',
  source        => 'http://central.maven.org/maven2/javax/transaction/jta/1.1/jta-1.1.jar',
  checksum      => '2ca09f0b36ca7d71b762e14ea2ff09d5eac57558',
  checksum_type => 'sha1',
  creates       => '/tmp/javax',
  cleanup       => true,
  user          => 'vagrant',
  group         => 'vagrant',
}
