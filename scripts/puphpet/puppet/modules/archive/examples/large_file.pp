archive { '/tmp/CentOS-7.iso':
  ensure        => 'present',
  source        => 'http://mirrors.prometeus.net/centos/7/isos/x86_64/CentOS-7-x86_64-DVD-1511.iso',
  checksum      => '4c6c65b5a70a1142dadb3c65238e9e97253c0d3a',
  checksum_type => 'sha1',
  provider      => ruby,
}
