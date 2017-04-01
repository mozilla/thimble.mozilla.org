# Define: swap_file::files
#
# This is a defined type to create a swap_file
#
# == Parameters
# [*ensure*]
#   Allows creation or removal of swapspace and the corresponding file.
# [*swapfile*]
#   Location of swapfile, defaults to /mnt
# [*swapfilesize*]
#   Size of the swapfile as a string (eg. 10 MB, 1.2 GB).
#   Defaults to $::memorysize fact on the node
# [*add_mount*]
#   Add a mount to the swapfile so it persists on boot
# [*options*]
#   Mount options for the swapfile
# [*timeout*]
#   dd command exec timeout.
#   Defaults to 300
# [*cmd*]
#   What command is used to create the file, dd or fallocate. dd is better tested and safer but fallocate is significantly faster.
#   Defaults to dd
#
# == Examples
#
#   swap_file::files { 'default':
#     ensure   => present,
#     swapfile => '/mnt/swap.55',
#   }
#
# == Authors
#    @petems - Peter Souter
#
define swap_file::files (
  $ensure        = 'present',
  $swapfile      = '/mnt/swap.1',
  $swapfilesize  = $::memorysize,
  $add_mount     = true,
  $options       = 'defaults',
  $timeout       = 300,
  $cmd           = 'dd',
  $resize_existing = false,
  $resize_margin   = '50MB',
  $resize_verbose  = false,
)
{
  # Parameter validation
  validate_re($ensure, ['^absent$', '^present$'], "Invalid ensure: ${ensure} - (Must be 'present' or 'absent')")
  validate_string($swapfile)
  $swapfilesize_mb = to_bytes($swapfilesize) / 1048576
  validate_bool($add_mount)

  if $ensure == 'present' {

    if ($resize_existing and $::swapfile_sizes) {

      if (is_hash($::swapfile_sizes)) {

        if (has_key($::swapfile_sizes,$swapfile)) {
          ::swap_file::resize { $swapfile:
            swapfile_path          => $swapfile,
            margin                 => $resize_margin,
            expected_swapfile_size => $swapfilesize,
            actual_swapfile_size   => $::swapfile_sizes[$swapfile],
            verbose                => $resize_verbose,
            before                 => Exec["Create swap file ${swapfile}"],
          }
        }

      } else {
        $existing_swapfile_size = swap_file_size_from_csv($swapfile,$::swapfile_sizes_csv)
        if ($existing_swapfile_size) {
          ::swap_file::resize { $swapfile:
            swapfile_path          => $swapfile,
            margin                 => $resize_margin,
            expected_swapfile_size => $swapfilesize,
            actual_swapfile_size   => $existing_swapfile_size,
            verbose                => $resize_verbose,
            before                 => Exec["Create swap file ${swapfile}"],
          }
        }
      }
    }

    exec { "Create swap file ${swapfile}":
      creates => $swapfile,
      timeout => $timeout,
    }
    case $cmd {
      'dd': {
        Exec["Create swap file ${swapfile}"] { command => "/bin/dd if=/dev/zero of=${swapfile} bs=1M count=${swapfilesize_mb}" }
      }
      'fallocate': {
        Exec["Create swap file ${swapfile}"] { command => "/usr/bin/fallocate -l ${swapfilesize_mb}M ${swapfile}" }
      }
      default: {
        fail("Invalid cmd: ${cmd} - (Must be 'dd' or 'fallocate')")
      }
    }
    file { $swapfile:
      owner   => root,
      group   => root,
      mode    => '0600',
      require => Exec["Create swap file ${swapfile}"],
    }
    swap_file { $swapfile:
      ensure  => 'present',
      require => File[$swapfile]
    }
    if $add_mount {
      mount { $swapfile:
        ensure  => present,
        fstype  => swap,
        device  => $swapfile,
        options => $options,
        dump    => 0,
        pass    => 0,
        require => Swap_file[$swapfile],
      }
    }
  }
  elsif $ensure == 'absent' {
    swap_file { $swapfile:
      ensure  => 'absent',
    }
    file { $swapfile:
      ensure  => absent,
      backup  => false,
      require => Swap_file[$swapfile],
    }
    mount { $swapfile:
      ensure => absent,
      device => $swapfile,
    }
  }
}
