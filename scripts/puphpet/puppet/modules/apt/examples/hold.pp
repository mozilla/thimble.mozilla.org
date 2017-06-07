apt::pin { 'hold-vim':
  packages => 'vim',
  version  => '2:7.4.488-5',
  priority => 1001,
}
