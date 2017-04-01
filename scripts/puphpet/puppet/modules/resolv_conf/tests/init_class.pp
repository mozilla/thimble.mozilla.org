class { '::resolv_conf':
  domainname  => 'example.com',
  searchpath  => 'example.com',
  nameservers => ['192.168.0.1', '192.168.1.1', '192.168.2.1'],
  options     => ['timeout:2', 'attempts:3'],
}
