# == Define: elasticsearch::service::openbsd
#
# This class exists to coordinate all service management related actions,
# functionality and logical units in a central place.
#
# <b>Note:</b> "service" is the Puppet term and type for background processes
# in general and is used in a platform-independent way. E.g. "service" means
# "daemon" in relation to Unix-like systems.
#
#
# === Parameters
#
# [*ensure*]
#   String. Controls if the managed resources shall be <tt>present</tt> or
#   <tt>absent</tt>. If set to <tt>absent</tt>:
#   * The managed software packages are being uninstalled.
#   * Any traces of the packages will be purged as good as possible. This may
#     include existing configuration files. The exact behavior is provider
#     dependent. Q.v.:
#     * Puppet type reference: {package, "purgeable"}[http://j.mp/xbxmNP]
#     * {Puppet's package provider source code}[http://j.mp/wtVCaL]
#   * System modifications (if any) will be reverted as good as possible
#     (e.g. removal of created users, services, changed log settings, ...).
#   * This is thus destructive and should be used with care.
#   Defaults to <tt>present</tt>.
#
# [*status*]
#   String to define the status of the service. Possible values:
#   * <tt>enabled</tt>: Service is running and will be started at boot time.
#   * <tt>disabled</tt>: Service is stopped and will not be started at boot
#     time.
#   * <tt>running</tt>: Service is running but will not be started at boot time.
#     You can use this to start a service on the first Puppet run instead of
#     the system startup.
#   * <tt>unmanaged</tt>: Service will not be started at boot time and Puppet
#     does not care whether the service is running or not. For example, this may
#     be useful if a cluster management software is used to decide when to start
#     the service plus assuring it is running on the desired node.
#   Defaults to <tt>enabled</tt>. The singular form ("service") is used for the
#   sake of convenience. Of course, the defined status affects all services if
#   more than one is managed (see <tt>service.pp</tt> to check if this is the
#   case).
#
# [*pid_dir*]
#   String, directory where to store the serice pid file
#
# [*init_template*]
#   Service file as a template
#
# [*service_flags*]
#   String, flags to pass to the service
#
# === Authors
#
# * Richard Pijnenburg <mailto:richard.pijnenburg@elasticsearch.com>
#
define elasticsearch::service::openbsd(
  $ensure             = $elasticsearch::ensure,
  $status             = $elasticsearch::status,
  $pid_dir            = $elasticsearch::pid_dir,
  $init_template      = $elasticsearch::init_template,
  $service_flags      = undef,
) {

  #### Service management

  # set params: in operation
  if $ensure == 'present' {

    case $status {
      # make sure service is currently running, start it on boot
      'enabled': {
        $service_ensure = 'running'
        $service_enable = true
      }
      # make sure service is currently stopped, do not start it on boot
      'disabled': {
        $service_ensure = 'stopped'
        $service_enable = false
      }
      # make sure service is currently running, do not start it on boot
      'running': {
        $service_ensure = 'running'
        $service_enable = false
      }
      # do not start service on boot, do not care whether currently running
      # or not
      'unmanaged': {
        $service_ensure = undef
        $service_enable = false
      }
      # unknown status
      # note: don't forget to update the parameter check in init.pp if you
      #       add a new or change an existing status.
      default: {
        fail("\"${status}\" is an unknown service status value")
      }
    }

  # set params: removal
  } else {

    # make sure the service is stopped and disabled (the removal itself will be
    # done by package.pp)
    $service_ensure = 'stopped'
    $service_enable = false

  }

  $notify_service = $elasticsearch::restart_config_change ? {
    true  => Service["elasticsearch-instance-${name}"],
    false => undef,
  }

  if ( $status != 'unmanaged' and $ensure == 'present' ) {

    # init file from template
    if ($init_template != undef) {

      file { "/etc/rc.d/elasticsearch_${name}":
        ensure  => $ensure,
        content => template($init_template),
        owner   => 'root',
        group   => '0',
        mode    => '0555',
        before  => Service["elasticsearch-instance-${name}"],
        notify  => $notify_service,
      }

    }

  } elsif ($status != 'unmanaged') {

    file { "/etc/rc.d/elasticsearch_${name}":
      ensure    => 'absent',
      subscribe => Service["elasticsearch-instance-${name}"],
    }

  }

  if ( $status != 'unmanaged') {

    # action
    service { "elasticsearch-instance-${name}":
      ensure     => $service_ensure,
      enable     => $service_enable,
      name       => "elasticsearch_${name}",
      flags      => $service_flags,
      hasstatus  => $elasticsearch::params::service_hasstatus,
      hasrestart => $elasticsearch::params::service_hasrestart,
      pattern    => $elasticsearch::params::service_pattern,
    }

  }

}
