# PRIVATE CLASS: do not call directly
class mongodb::server::config {
  $ensure          = $mongodb::server::ensure
  $user            = $mongodb::server::user
  $group           = $mongodb::server::group
  $config          = $mongodb::server::config
  $config_content  = $mongodb::server::config_content

  $dbpath          = $mongodb::server::dbpath
  $pidfilepath     = $mongodb::server::pidfilepath
  $logpath         = $mongodb::server::logpath
  $logappend       = $mongodb::server::logappend
  $fork            = $mongodb::server::fork
  $port            = $mongodb::server::port
  $journal         = $mongodb::server::journal
  $nojournal       = $mongodb::server::nojournal
  $smallfiles      = $mongodb::server::smallfiles
  $cpu             = $mongodb::server::cpu
  $auth            = $mongodb::server::auth
  $noath           = $mongodb::server::noauth
  $create_admin    = $mongodb::server::create_admin
  $admin_username  = $mongodb::server::admin_username
  $admin_password  = $mongodb::server::admin_password
  $store_creds     = $mongodb::server::store_creds
  $rcfile          = $mongodb::server::rcfile
  $verbose         = $mongodb::server::verbose
  $verbositylevel  = $mongodb::server::verbositylevel
  $objcheck        = $mongodb::server::objcheck
  $quota           = $mongodb::server::quota
  $quotafiles      = $mongodb::server::quotafiles
  $diaglog         = $mongodb::server::diaglog
  $oplog_size      = $mongodb::server::oplog_size
  $nohints         = $mongodb::server::nohints
  $nohttpinterface = $mongodb::server::nohttpinterface
  $noscripting     = $mongodb::server::noscripting
  $notablescan     = $mongodb::server::notablescan
  $noprealloc      = $mongodb::server::noprealloc
  $nssize          = $mongodb::server::nssize
  $mms_token       = $mongodb::server::mms_token
  $mms_name        = $mongodb::server::mms_name
  $mms_interval    = $mongodb::server::mms_interval
  $master          = $mongodb::server::master
  $slave           = $mongodb::server::slave
  $only            = $mongodb::server::only
  $source          = $mongodb::server::source
  $configsvr       = $mongodb::server::configsvr
  $shardsvr        = $mongodb::server::shardsvr
  $replset         = $mongodb::server::replset
  $rest            = $mongodb::server::rest
  $quiet           = $mongodb::server::quiet
  $slowms          = $mongodb::server::slowms
  $keyfile         = $mongodb::server::keyfile
  $key             = $mongodb::server::key
  $ipv6            = $mongodb::server::ipv6
  $bind_ip         = $mongodb::server::bind_ip
  $directoryperdb  = $mongodb::server::directoryperdb
  $profile         = $mongodb::server::profile
  $maxconns        = $mongodb::server::maxconns
  $set_parameter   = $mongodb::server::set_parameter
  $syslog          = $mongodb::server::syslog
  $ssl             = $mongodb::server::ssl
  $ssl_key         = $mongodb::server::ssl_key
  $ssl_ca          = $mongodb::server::ssl_ca
  $storage_engine  = $mongodb::server::storage_engine
  $version         = $mongodb::server::version

  File {
    owner => $user,
    group => $group,
  }

  if ($logpath and $syslog) { fail('You cannot use syslog with logpath')}

  if ($ensure == 'present' or $ensure == true) {

    # Exists for future compatibility and clarity.
    if $auth {
      $noauth = false
    }
    else {
      $noauth = true
    }
    if $keyfile and $key {
      validate_string($key)
      validate_re($key,'.{6}')
      file { $keyfile:
        content => $key,
        owner   => $user,
        group   => $group,
        mode    => '0400',
      }
    }

    if empty($storage_engine) {
      $storage_engine_internal = undef
    } else {
      $storage_engine_internal = $storage_engine
    }


    #Pick which config content to use
    if $config_content {
      $cfg_content = $config_content
    } elsif $version and (versioncmp($version, '2.6.0') >= 0) {
      # Template uses:
      # - $auth
      # - $bind_ip
      # - $configsvr
      # - $dbpath
      # - $directoryperdb
      # - $fork
      # - $ipv6
      # - $jounal
      # - $keyfile
      # - $logappend
      # - $logpath
      # - $maxconns
      # - $nohttpinteface
      # - $nojournal
      # - $noprealloc
      # - $noscripting
      # - $nssize
      # - $objcheck
      # - $oplog_size
      # - $pidfilepath
      # - $port
      # - $profile
      # - $quota
      # - $quotafiles
      # - $replset
      # - $rest
      # - $set_parameter
      # - $shardsvr
      # - $slowms
      # - $smallfiles
      # - $ssl
      # - $ssl_ca
      # - $ssl_key
      # - $syslog
      # - $verbose
      # - $verbositylevel
      $cfg_content = template('mongodb/mongodb.conf.2.6.erb')
    } else {
      # Fall back to oldest most basic config
      # Template uses:
      # - $auth
      # - $bind_ip
      # - $configsvr
      # - $cpu
      # - $dbpath
      # - $diaglog
      # - $directoryperdb
      # - $fork
      # - $ipv6
      # - $jounal
      # - $keyfile
      # - $logappend
      # - $logpath
      # - $master
      # - $maxconns
      # - $mms_interval
      # - $mms_name
      # - $mms_token
      # - $noauth
      # - $nohints
      # - $nohttpinteface
      # - $nojournal
      # - $noprealloc
      # - $noscripting
      # - $notablescan
      # - $nssize
      # - $objcheck
      # - $only
      # - $oplog_size
      # - $pidfilepath
      # - $port
      # - $profile
      # - $quiet
      # - $quota
      # - $quotafiles
      # - $replset
      # - $rest
      # - $set_parameter
      # - $shardsvr
      # - $slave
      # - $slowms
      # - $smallfiles
      # - $source
      # - $ssl
      # - $ssl_ca
      # - $ssl_key
      # - storage_engine_internal
      # - $syslog
      # - $verbose
      # - $verbositylevel
      $cfg_content = template('mongodb/mongodb.conf.erb')
    }

    file { $config:
      content => $cfg_content,
      owner   => 'root',
      group   => 'root',
      mode    => '0644',
    }

    file { $dbpath:
      ensure  => directory,
      mode    => '0755',
      owner   => $user,
      group   => $group,
      require => File[$config]
    }

    if $pidfilepath {
      file { $pidfilepath:
        ensure => file,
        mode   => '0644',
        owner  => $user,
        group  => $group,
      }
    }
  } else {
    file { $dbpath:
      ensure => absent,
      force  => true,
      backup => false,
    }
    file { $config:
      ensure => absent
    }
  }

  if $auth and $store_creds {
    file { $rcfile:
      ensure  => present,
      content => template('mongodb/mongorc.js.erb'),
      owner   => 'root',
      group   => 'root',
      mode    => '0600'
    }
  } else {
    file { $rcfile:
      ensure => absent
    }
  }
}
