node default {
  class { '::swap_file':
    files => {
      'swapfile'         => {
        ensure => 'present', # lint:ignore:ensure_first_param
      },
      'use fallocate'    => {
        swapfile => '/tmp/swapfile.fallocate',
        cmd      => 'fallocate',
      },
      'remove swap file' => {
        ensure   => 'absent', # lint:ignore:ensure_first_param
        swapfile => '/tmp/swapfile.old',
      },
    },
  }
}
