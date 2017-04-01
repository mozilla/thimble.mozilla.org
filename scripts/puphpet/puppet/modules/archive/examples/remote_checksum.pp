include '::archive'

archive { '/tmp/hawtio-web-1.4.36.jar':
  ensure        => present,
  extract       => false,
  extract_path  => '/tmp',
  source        => 'https://oss.sonatype.org/service/local/artifact/maven/content?g=io.hawt&a=hawtio-web&v=1.4.36&p=war&r=releases',
  checksum_url  => 'https://oss.sonatype.org/service/local/artifact/maven/content?g=io.hawt&a=hawtio-web&v=1.4.36&p=war.md5&r=releases',
  checksum_type => 'md5',
}
