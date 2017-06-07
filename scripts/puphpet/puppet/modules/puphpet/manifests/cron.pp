# Class for defining cron jobs
#
class puphpet::cron {

  include ::puphpet::params

  $cron = $puphpet::params::hiera['cron']

  # config file could contain no jobs key
  $jobs = array_true($cron, 'jobs') ? {
    true    => $cron['jobs'],
    default => { }
  }

  each( $jobs ) |$key, $job| {
    # Deletes empty cron jobs
    $job_values = delete_values($job, '')

    create_resources(cron, { "${key}" => $job_values })
  }

}
