class puphpet  (
  $extra_config_files = []
) {

  class { '::puphpet::params':
    extra_config_files => $extra_config_files,
  }

  Exec { path => [ '/bin/', '/sbin/', '/usr/bin/', '/usr/sbin/' ] }
  Vcsrepo { require => Package['git'] }

  include ::puphpet::cron
  include ::puphpet::firewall
  include ::puphpet::locale
  include ::puphpet::resolv
  include ::puphpet::ruby
  include ::puphpet::server
  include ::puphpet::usersgroups

  if array_true($puphpet::params::hiera['apache'], 'install') {
    include ::puphpet::apache::install
  }

  if array_true($puphpet::params::hiera['beanstalkd'], 'install') {
    include ::puphpet::beanstalkd::install
  }

  if array_true($puphpet::params::hiera['drush'], 'install') {
    include ::puphpet::drush::install
  }

  if array_true($puphpet::params::hiera['elasticsearch'], 'install') {
    include ::puphpet::elasticsearch::install
  }

  if array_true($puphpet::params::hiera['hhvm'], 'install') {
    include ::puphpet::hhvm::install
  }

  if array_true($puphpet::params::hiera['mailhog'], 'install') {
    include ::puphpet::mailhog::install
  }

  if array_true($puphpet::params::hiera['mariadb'], 'install')
    and ! array_true($puphpet::params::hiera['mysql'], 'install')
  {
    include ::puphpet::mariadb::install
  }

  if array_true($puphpet::params::hiera['mongodb'], 'install') {
    include ::puphpet::mongodb::install
  }

  if array_true($puphpet::params::hiera['mysql'], 'install')
    and ! array_true($puphpet::params::hiera['mariadb'], 'install')
  {
    include ::puphpet::mysql::install
  }

  if array_true($puphpet::params::hiera['nginx'], 'install') {
    include ::puphpet::nginx::install
  }

  if array_true($puphpet::params::hiera['nodejs'], 'install') {
    include ::puphpet::nodejs::install
  }

  if array_true($puphpet::params::hiera['php'], 'install') {
    include ::puphpet::php::install

    if array_true($puphpet::params::hiera['blackfire'], 'install') {
      include ::puphpet::blackfire::install
    }

    if array_true($puphpet::params::hiera['xhprof'], 'install') {
      include ::puphpet::xhprof
    }
  }

  if array_true($puphpet::params::hiera['postgresql'], 'install') {
    include ::puphpet::postgresql::install
  }

  if array_true($puphpet::params::hiera['python'], 'install') {
    include ::puphpet::python::install
  }

  if array_true($puphpet::params::hiera['rabbitmq'], 'install') {
    include ::puphpet::rabbitmq::install
  }

  if array_true($puphpet::params::hiera['redis'], 'install') {
    include ::puphpet::redis::install
  }

  if array_true($puphpet::params::hiera['letsencrypt'], 'install') {
    include ::puphpet::letsencrypt::install
  }

  if array_true($puphpet::params::hiera['solr'], 'install') {
    include ::puphpet::solr::install
  }

  if array_true($puphpet::params::hiera['sqlite'], 'install') {
    include ::puphpet::sqlite::install
  }

  if array_true($puphpet::params::hiera['wpcli'], 'install') {
    include ::puphpet::wpcli
  }

}
