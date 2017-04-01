class apt::params {

  if $::osfamily != 'Debian' {
    fail('This module only works on Debian or derivatives like Ubuntu')
  }

  # prior to puppet 3.5.0, defined() couldn't test if a variable was defined.
  # strict_variables wasn't added until 3.5.0, so this should be fine.
  if $::puppetversion and versioncmp($::puppetversion, '3.5.0') < 0 {
    $xfacts = {
      'lsbdistcodename'     => $::lsbdistcodename,
      'lsbdistrelease'      => $::lsbdistrelease,
      'lsbdistid'           => $::lsbdistid,
    }
  } else {
    # Strict variables facts lookup compatibility
    $xfacts = {
      'lsbdistcodename' => defined('$lsbdistcodename') ? {
        true    => $::lsbdistcodename,
        default => undef,
      },
      'lsbdistrelease' => defined('$lsbdistrelease') ? {
        true    => $::lsbdistrelease,
        default => undef,
      },
      'lsbdistid' => defined('$lsbdistid') ? {
        true    => $::lsbdistid,
        default => undef,
      },
    }
  }

  $root           = '/etc/apt'
  $provider       = '/usr/bin/apt-get'
  $sources_list   = "${root}/sources.list"
  $sources_list_d = "${root}/sources.list.d"
  $conf_d         = "${root}/apt.conf.d"
  $preferences    = "${root}/preferences"
  $preferences_d  = "${root}/preferences.d"
  $keyserver      = 'keyserver.ubuntu.com'

  $config_files = {
    'conf'   => {
      'path' => $conf_d,
      'ext'  => '',
    },
    'pref'   => {
      'path' => $preferences_d,
      'ext'  => '.pref',
    },
    'list'   => {
      'path' => $sources_list_d,
      'ext'  => '.list',
    }
  }

  $update_defaults = {
    'frequency' => 'reluctantly',
    'timeout'   => undef,
    'tries'     => undef,
  }

  $proxy_defaults = {
    'ensure' => undef,
    'host'   => undef,
    'port'   => 8080,
    'https'  => false,
  }

  $purge_defaults = {
    'sources.list'   => false,
    'sources.list.d' => false,
    'preferences'    => false,
    'preferences.d'  => false,
  }

  $source_key_defaults = {
    'server'  => $keyserver,
    'options' => undef,
    'content' => undef,
    'source'  => undef,
  }

  $include_defaults = {
    'deb' => true,
    'src' => false,
  }

  case $xfacts['lsbdistid'] {
    'debian': {
      case $xfacts['lsbdistcodename'] {
        'squeeze': {
          $backports = {
            'location' => 'http://httpredir.debian.org/debian-backports',
            'key'      => 'A1BD8E9D78F7FE5C3E65D8AF8B48AD6246925553',
            'repos'    => 'main contrib non-free',
          }
        }
        default: {
          $backports = {
            'location' => 'http://httpredir.debian.org/debian',
            'key'      => 'A1BD8E9D78F7FE5C3E65D8AF8B48AD6246925553',
            'repos'    => 'main contrib non-free',
          }
        }
      }

      $ppa_options = undef
      $ppa_package = undef

    }
    'ubuntu': {
      $backports = {
        'location' => 'http://archive.ubuntu.com/ubuntu',
        'key'      => '630239CC130E1A7FD81A27B140976EAF437D05B5',
        'repos'    => 'main universe multiverse restricted',
      }

      if $xfacts['lsbdistcodename'] == 'lucid' {
          $ppa_options        = undef
          $ppa_package        = 'python-software-properties'
      } elsif $xfacts['lsbdistcodename'] == 'precise' {
          $ppa_options        = '-y'
          $ppa_package        = 'python-software-properties'
      } elsif versioncmp($xfacts['lsbdistrelease'], '14.04') >= 0 {
          $ppa_options        = '-y'
          $ppa_package        = 'software-properties-common'
      } else {
          $ppa_options        = '-y'
          $ppa_package        = 'python-software-properties'
      }
    }
    undef: {
      fail('Unable to determine lsbdistid, please install lsb-release first')
    }
    default: {
      $ppa_options = undef
      $ppa_package = undef
      $backports   = undef
    }
  }
}
