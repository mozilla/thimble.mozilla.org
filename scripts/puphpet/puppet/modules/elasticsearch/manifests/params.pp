# == Class: elasticsearch::params
#
# This class exists to
# 1. Declutter the default value assignment for class parameters.
# 2. Manage internally used module variables in a central place.
#
# Therefore, many operating system dependent differences (names, paths, ...)
# are addressed in here.
#
#
# === Parameters
#
# This class does not provide any parameters.
#
#
# === Examples
#
# This class is not intended to be used directly.
#
#
# === Links
#
# * {Puppet Docs: Using Parameterized Classes}[http://j.mp/nVpyWY]
#
#
# === Authors
#
# * Richard Pijnenburg <mailto:richard@ispavailability.com>
#
class elasticsearch::params {

  #### Default values for the parameters of the main module class, init.pp

  # ensure
  $ensure = 'present'

  # autoupgrade
  $autoupgrade = false

  # service status
  $status = 'enabled'

  # restart on configuration change?
  $restart_on_change = false

  # Purge configuration directory
  $purge_configdir = false

  $purge_package_dir = false

  # package download timeout
  $package_dl_timeout = 600 # 300 seconds is default of puppet

  $default_logging_level = 'INFO'

  $logging_defaults = {
    'action'                 => 'DEBUG',
    'com.amazonaws'          => 'WARN',
    'index.search.slowlog'   => 'TRACE, index_search_slow_log_file',
    'index.indexing.slowlog' => 'TRACE, index_indexing_slow_log_file',
  }

  #### Internal module values

  # User and Group for the files and user to run the service as.
  case $::kernel {
    'Linux': {
      $elasticsearch_user  = 'elasticsearch'
      $elasticsearch_group = 'elasticsearch'
    }
    'Darwin': {
      $elasticsearch_user  = 'elasticsearch'
      $elasticsearch_group = 'elasticsearch'
    }
    'OpenBSD': {
      $elasticsearch_user  = '_elasticsearch'
      $elasticsearch_group = '_elasticsearch'
    }
    default: {
      fail("\"${module_name}\" provides no user/group default value
           for \"${::kernel}\"")
    }
  }

  # Download tool

  case $::kernel {
    'Linux': {
      $download_tool = 'wget --no-check-certificate -O'
    }
    'Darwin': {
      $download_tool = 'curl --insecure -o'
    }
    'OpenBSD': {
      $download_tool = 'ftp -o'
    }
    default: {
      fail("\"${module_name}\" provides no download tool default value
           for \"${::kernel}\"")
    }
  }

  # Different path definitions
  case $::kernel {
    'Linux': {
      $configdir   = '/etc/elasticsearch'
      $logdir      = '/var/log/elasticsearch'
      $package_dir = '/opt/elasticsearch/swdl'
      $installpath = '/opt/elasticsearch'
      $homedir     = '/usr/share/elasticsearch'
      $plugindir   = "${homedir}/plugins"
      $datadir     = '/usr/share/elasticsearch/data'
    }
    'OpenBSD': {
      $configdir   = '/etc/elasticsearch'
      $logdir      = '/var/log/elasticsearch'
      $package_dir = '/var/cache/elasticsearch'
      $installpath = undef
      $homedir     = '/usr/local/elasticsearch'
      $plugindir   = "${homedir}/plugins"
      $datadir     = '/var/elasticsearch/data'
    }
    default: {
      fail("\"${module_name}\" provides no config directory default value
           for \"${::kernel}\"")
    }
  }

  # packages
  case $::operatingsystem {
    'RedHat', 'CentOS', 'Fedora', 'Scientific', 'Amazon', 'OracleLinux', 'SLC': {
      # main application
      $package = [ 'elasticsearch' ]
    }
    'Debian', 'Ubuntu': {
      # main application
      $package = [ 'elasticsearch' ]
    }
    'OpenSuSE', 'SLES': {
      $package = [ 'elasticsearch' ]
    }
    'Gentoo': {
      $package = [ 'app-misc/elasticsearch' ]
    }
    'OpenBSD': {
      $package = [ 'elasticsearch' ]
    }
    default: {
      fail("\"${module_name}\" provides no package default value
            for \"${::operatingsystem}\"")
    }
  }

  # service parameters
  case $::operatingsystem {
    'RedHat', 'CentOS', 'Fedora', 'Scientific', 'OracleLinux', 'SLC': {
      $service_name       = 'elasticsearch'
      $service_hasrestart = true
      $service_hasstatus  = true
      $service_pattern    = $service_name
      $defaults_location  = '/etc/sysconfig'
      $pid_dir            = '/var/run/elasticsearch'

      if versioncmp($::operatingsystemmajrelease, '7') >= 0 {
        $init_template        = 'elasticsearch.systemd.erb'
        $service_providers    = 'systemd'
        $systemd_service_path = '/lib/systemd/system'
      } else {
        $init_template        = 'elasticsearch.RedHat.erb'
        $service_providers    = 'init'
        $systemd_service_path = undef
      }

    }
    'Amazon': {
      $service_name         = 'elasticsearch'
      $service_hasrestart   = true
      $service_hasstatus    = true
      $service_pattern      = $service_name
      $defaults_location    = '/etc/sysconfig'
      $pid_dir              = '/var/run/elasticsearch'
      $init_template        = 'elasticsearch.RedHat.erb'
      $service_providers    = 'init'
      $systemd_service_path = undef
    }
    'Debian': {
      $service_name       = 'elasticsearch'
      $service_hasrestart = true
      $service_hasstatus  = true
      $service_pattern    = $service_name
      $defaults_location  = '/etc/default'
      if versioncmp($::operatingsystemmajrelease, '8') >= 0 {
        $init_template        = 'elasticsearch.systemd.erb'
        $service_providers    = 'systemd'
        $systemd_service_path = '/lib/systemd/system'
        $pid_dir              = '/var/run/elasticsearch'
      } else {
        $init_template        = 'elasticsearch.Debian.erb'
        $pid_dir              = false
        $service_providers    = [ 'init' ]
        $systemd_service_path = undef
      }
    }
    'Ubuntu': {
      $service_name       = 'elasticsearch'
      $service_hasrestart = true
      $service_hasstatus  = true
      $service_pattern    = $service_name
      $defaults_location  = '/etc/default'

      if versioncmp($::operatingsystemmajrelease, '15') >= 0 {
        $init_template        = 'elasticsearch.systemd.erb'
        $service_providers    = 'systemd'
        $systemd_service_path = '/lib/systemd/system'
        $pid_dir              = '/var/run/elasticsearch'
      } else {
        $init_template        = 'elasticsearch.Debian.erb'
        $pid_dir              = false
        $service_providers    = [ 'init' ]
        $systemd_service_path = undef
      }
    }
    'Darwin': {
      $service_name         = 'FIXME/TODO'
      $service_hasrestart   = true
      $service_hasstatus    = true
      $service_pattern      = $service_name
      $service_providers    = 'launchd'
      $systemd_service_path = undef
      $defaults_location    = false
      $pid_dir              = false
    }
    'OpenSuSE': {
      $service_name          = 'elasticsearch'
      $service_hasrestart    = true
      $service_hasstatus     = true
      $service_pattern       = $service_name
      $service_providers     = 'systemd'
      $defaults_location     = '/etc/sysconfig'
      $init_template         = 'elasticsearch.systemd.erb'
      $pid_dir               = '/var/run/elasticsearch'
      if versioncmp($::operatingsystemmajrelease, '12') <= 0 {
        $systemd_service_path = '/lib/systemd/system'
      } else {
        $systemd_service_path = '/usr/lib/systemd/system'
      }
    }
    'SLES': {
      $service_name       = 'elasticsearch'
      $service_hasrestart = true
      $service_hasstatus  = true
      $service_pattern    = $service_name
      $defaults_location  = '/etc/sysconfig'

      if versioncmp($::operatingsystemmajrelease, '12') >= 0 {
        $init_template        = 'elasticsearch.systemd.erb'
        $service_providers    = 'systemd'
        $systemd_service_path = '/usr/lib/systemd/system'
        $pid_dir              = '/var/run/elasticsearch'
      } else {
        $init_template        = 'elasticsearch.SLES.erb'
        $service_providers    = [ 'init' ]
        $systemd_service_path = undef
        $pid_dir              = false
      }
    }
    'Gentoo': {
      $service_name         = 'elasticsearch'
      $service_hasrestart   = true
      $service_hasstatus    = true
      $service_pattern      = $service_name
      $service_providers    = 'openrc'
      $systemd_service_path = undef
      $defaults_location    = '/etc/conf.d'
      $init_template        = 'elasticsearch.openrc.erb'
      $pid_dir              = '/run/elasticsearch'
    }
    'OpenBSD': {
      $service_name         = 'elasticsearch'
      $service_hasrestart   = true
      $service_hasstatus    = true
      $service_pattern      = undef
      $service_providers    = 'openbsd'
      $systemd_service_path = undef
      $defaults_location    = undef
      $init_template        = 'elasticsearch.OpenBSD.erb'
      $pid_dir              = '/var/run/elasticsearch'
    }
    default: {
      fail("\"${module_name}\" provides no service parameters
            for \"${::operatingsystem}\"")
    }
  }
}
