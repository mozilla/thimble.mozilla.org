# = Class: redis::service
#
# This class manages the Redis daemon.
#
class redis::service {
  if $::redis::service_manage {
    service { $::redis::service_name:
      ensure     => $::redis::service_ensure,
      enable     => $::redis::service_enable,
      hasrestart => $::redis::service_hasrestart,
      hasstatus  => $::redis::service_hasstatus,
      provider   => $::redis::service_provider,
    }
  }
}

