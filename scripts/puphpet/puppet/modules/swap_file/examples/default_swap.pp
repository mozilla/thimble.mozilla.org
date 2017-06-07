node default {
  swap_file::files { 'default':
    ensure   => present,
  }
}
