# See README.me for usage.
class mysql::backup::xtrabackup (
  $xtrabackup_package_name = $mysql::params::xtrabackup_package_name,
  $backupuser              = '',
  $backuppassword          = '',
  $backupdir               = '',
  $maxallowedpacket        = '1M',
  $backupmethod            = 'mysqldump',
  $backupdirmode           = '0700',
  $backupdirowner          = 'root',
  $backupdirgroup          = $mysql::params::root_group,
  $backupcompress          = true,
  $backuprotate            = 30,
  $ignore_events           = true,
  $delete_before_dump      = false,
  $backupdatabases         = [],
  $file_per_database       = false,
  $include_triggers        = true,
  $include_routines        = false,
  $ensure                  = 'present',
  $time                    = ['23', '5'],
  $prescript               = false,
  $postscript              = false,
  $execpath                = '/usr/bin:/usr/sbin:/bin:/sbin',
) inherits mysql::params {

  package{ $xtrabackup_package_name:
    ensure  => $ensure,
  }

  cron { 'xtrabackup-weekly':
    ensure  => $ensure,
    command => "/usr/local/sbin/xtrabackup.sh ${backupdir}",
    user    => 'root',
    hour    => $time[0],
    minute  => $time[1],
    weekday => '0',
    require => Package[$xtrabackup_package_name],
  }

  cron { 'xtrabackup-daily':
    ensure  => $ensure,
    command => "/usr/local/sbin/xtrabackup.sh --incremental ${backupdir}",
    user    => 'root',
    hour    => $time[0],
    minute  => $time[1],
    weekday => '1-6',
    require => Package[$xtrabackup_package_name],
  }

  file { 'mysqlbackupdir':
    ensure => 'directory',
    path   => $backupdir,
    mode   => $backupdirmode,
    owner  => $backupdirowner,
    group  => $backupdirgroup,
  }

  file { 'xtrabackup.sh':
    ensure  => $ensure,
    path    => '/usr/local/sbin/xtrabackup.sh',
    mode    => '0700',
    owner   => 'root',
    group   => $mysql::params::root_group,
    content => template('mysql/xtrabackup.sh.erb'),
  }
}
