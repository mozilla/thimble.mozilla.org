# = Class: redis::sentinel
#
# This class installs redis-sentinel
#
# == Parameters:
#
#
# [*auth_pass*]
#   The password to use to authenticate with the master and slaves.
#
#   Default: undef
#
# [*config_file*]
#   The location and name of the sentinel config file.
#
#   Default for deb: /etc/redis/redis-sentinel.conf
#   Default for rpm: /etc/redis-sentinel.conf
#
# [*config_file_orig*]
#   The location and name of a config file that provides the source
#   of the sentinel config file. Two different files are needed
#   because sentinel itself writes to its own config file and we do
#   not want override that when puppet is run unless there are
#   changes from the manifests.
#
#   Default for deb: /etc/redis/redis-sentinel.conf.puppet
#   Default for rpm: /etc/redis-sentinel.conf.puppet
#
# [*config_file_mode*]
#   Permissions of config file.
#
#   Default: 0644
#
# [*conf_template*]
#   Define which template to use.
#
#   Default: redis/redis-sentinel.conf.erb
#
# [*daemonize*]
#   Have Redis sentinel run as a daemon.
#
#   Default: true
#
# [*down_after*]
#   Number of milliseconds the master (or any attached slave or sentinel)
#   should be unreachable (as in, not acceptable reply to PING, continuously,
#   for the specified period) in order to consider it in S_DOWN state.
#
#   Default: 30000
#
# [*failover_timeout*]
#   Specify the failover timeout in milliseconds.
#
#   Default: 180000
#
# [*init_script*]
#   Specifiy the init script that will be created for sentinel.
#
#   Default: undef on rpm, /etc/init.d/redis-sentinel on apt.
#
# [*log_file*]
#   Specify where to write log entries.
#
#   Default: /var/log/redis/redis.log
#
# [*master_name*]
#   Specify the name of the master redis server.
#   The valid charset is A-z 0-9 and the three characters ".-_".
#
#   Default: mymaster
#
# [*redis_host*]
#   Specify the bound host of the master redis server.
#
#   Default: 127.0.0.1
#
# [*redis_port*]
#   Specify the port of the master redis server.
#
#   Default: 6379
#
# [*package_name*]
#   The name of the package that installs sentinel.
#
#   Default: 'redis-server' on apt, 'redis' on rpm
#
# [*package_ensure*]
#   Do we ensure this package.
#
#   Default: 'present'
#
# [*parallel_sync*]
#   How many slaves can be reconfigured at the same time to use a
#   new master after a failover.
#
#   Default: 1
#
# [*pid_file*]
#   If sentinel is daemonized it will write its pid at this location.
#
#   Default: /var/run/redis/redis-sentinel.pid
#
# [*quorum*]
#   Number of sentinels that must agree that a master is down to
#   signal sdown state.
#
#   Default: 2
#
# [*sentinel_bind*]
#   Allow optional sentinel server ip binding.  Can help overcome
#   issues arising from protect-mode added Redis 3.2
#
#   Default: undef
#
# [*sentinel_port*]
#   The port of sentinel server.
#
#   Default: 26379
#
# [*service_group*]
#   The group of the config file.
#
#   Default: redis
#
# [*service_name*]
#   The name of the service (for puppet to manage).
#
#   Default: redis-sentinel
#
# [*service_owner*]
#   The owner of the config file.
#
#   Default: redis
#
# [*working_dir*]
#   The directory into which sentinel will change to avoid mount
#   conflicts.
#
#   Default: /tmp
#
# [*notification_script*]
#   Path to the notification script
#
#   Default: undef
#
# [*client_reconfig_script*]
#   Path to the client-reconfig script
#
#   Default: undef
# == Actions:
#   - Install and configure Redis Sentinel
#
# == Sample Usage:
#
#   class { 'redis::sentinel': }
#
#   class {'redis::sentinel':
#     down_after => 80000,
#     log_file => '/var/log/redis/sentinel.log',
#   }
#
class redis::sentinel (
  $auth_pass              = $::redis::params::sentinel_auth_pass,
  $config_file            = $::redis::params::sentinel_config_file,
  $config_file_orig       = $::redis::params::sentinel_config_file_orig,
  $config_file_mode       = $::redis::params::sentinel_config_file_mode,
  $conf_template          = $::redis::params::sentinel_conf_template,
  $daemonize              = $::redis::params::sentinel_daemonize,
  $down_after             = $::redis::params::sentinel_down_after,
  $failover_timeout       = $::redis::params::sentinel_failover_timeout,
  $init_script            = $::redis::params::sentinel_init_script,
  $init_template          = $::redis::params::sentinel_init_template,
  $log_file               = $::redis::params::log_file,
  $master_name            = $::redis::params::sentinel_master_name,
  $redis_host             = $::redis::params::bind,
  $redis_port             = $::redis::params::port,
  $package_name           = $::redis::params::sentinel_package_name,
  $package_ensure         = $::redis::params::sentinel_package_ensure,
  $parallel_sync          = $::redis::params::sentinel_parallel_sync,
  $pid_file               = $::redis::params::sentinel_pid_file,
  $quorum                 = $::redis::params::sentinel_quorum,
  $sentinel_bind          = $::redis::params::sentinel_bind,
  $sentinel_port          = $::redis::params::sentinel_port,
  $service_group          = $::redis::params::service_group,
  $service_name           = $::redis::params::sentinel_service_name,
  $service_ensure         = $::redis::params::service_ensure,
  $service_user           = $::redis::params::service_user,
  $working_dir            = $::redis::params::sentinel_working_dir,
  $notification_script    = $::redis::params::sentinel_notification_script,
  $client_reconfig_script = $::redis::params::sentinel_client_reconfig_script,
) inherits redis::params {

  unless defined(Package[$package_name]) {
    ensure_resource('package', $package_name, {
      'ensure' => $package_ensure
    })
  }

  file {
    $config_file_orig:
      ensure  => present,
      owner   => $service_user,
      group   => $service_group,
      mode    => $config_file_mode,
      content => template($conf_template),
      require => Package[$package_name];
  }

  exec {
    "cp -p ${config_file_orig} ${config_file}":
      path        => '/usr/bin:/bin',
      subscribe   => File[$config_file_orig],
      notify      => Service[$service_name],
      refreshonly => true;
  }

  if $init_script {

    file {
      $init_script:
        ensure  => present,
        owner   => 'root',
        group   => 'root',
        mode    => '0755',
        content => template($init_template),
        require => Package[$package_name];
    }

    exec {
      '/usr/sbin/update-rc.d redis-sentinel defaults':
        subscribe   => File[$init_script],
        refreshonly => true;
    }

  }

  service { $service_name:
    ensure     => $service_ensure,
    enable     => $::redis::params::service_enable,
    hasrestart => $::redis::params::service_hasrestart,
    hasstatus  => $::redis::params::service_hasstatus,
  }

}
