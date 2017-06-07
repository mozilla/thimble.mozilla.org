apt::conf { 'progressbar':
  priority => 99,
  content  => 'Dpkg::Progress-Fancy "1";',
}
