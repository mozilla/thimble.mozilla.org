apt::conf { 'release':
  content  => 'APT::Default-Release "karmic";',
  priority => '01',
}
