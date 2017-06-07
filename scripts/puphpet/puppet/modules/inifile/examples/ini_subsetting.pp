ini_subsetting { 'sample subsetting':
  ensure            => 'present',
  section           => '',
  key_val_separator => '=',
  path              => '/etc/default/pe-puppetdb',
  setting           => 'JAVA_ARGS',
  subsetting        => '-Xmx',
  value             => '512m',
}

ini_subsetting { 'sample subsetting2':
  ensure            => 'absent',
  section           => '',
  key_val_separator => '=',
  path              => '/etc/default/pe-puppetdb',
  setting           => 'JAVA_ARGS',
  subsetting        => '-Xms',
}

ini_subsetting { 'sample subsetting3':
  ensure                       => 'present',
  section                      => '',
  key_val_separator            => '=',
  subsetting_key_val_separator => ':',
  path                         => '/etc/default/pe-puppetdb',
  setting                      => 'JAVA_ARGS',
  subsetting                   => '-XX',
  value                        => '+HeapDumpOnOutOfMemoryError',
  insert_type                  => 'after',
  insert_value                 => '-Xmx',
}
