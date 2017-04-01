# == Class: elasticsearch::repo
#
# This class exists to install and manage yum and apt repositories
# that contain elasticsearch official elasticsearch packages
#
#
# === Parameters
#
# This class does not provide any parameters.
#
#
# === Examples
#
# This class may be imported by other classes to use its functionality:
#   class { 'elasticsearch::repo': }
#
# It is not intended to be used directly by external resources like node
# definitions or other modules.
#
#
# === Authors
#
# * Phil Fenstermacher <mailto:phillip.fenstermacher@gmail.com>
# * Richard Pijnenburg <mailto:richard.pijnenburg@elasticsearch.com>
#
class elasticsearch::repo {

  Exec {
    path => [ '/bin', '/usr/bin', '/usr/local/bin' ],
    cwd  => '/',
  }

  case $::osfamily {
    'Debian': {
      include ::apt
      Class['apt::update'] -> Package[$elasticsearch::package_name]

      apt::source { 'elasticsearch':
        ensure      => $elasticsearch::ensure,
        location    => "http://packages.elastic.co/elasticsearch/${elasticsearch::repo_version}/debian",
        release     => 'stable',
        repos       => 'main',
        key         => $::elasticsearch::repo_key_id,
        key_source  => $::elasticsearch::repo_key_source,
        include_src => false,
        pin         => $elasticsearch::repo_priority,
      }
    }
    'RedHat', 'Linux': {
      # Versions prior to 3.5.1 have issues with this param
      # See: https://tickets.puppetlabs.com/browse/PUP-2163
      if versioncmp($::puppetversion, '3.5.1') >= 0 {
        Yumrepo['elasticsearch'] {
          ensure => $elasticsearch::ensure,
        }
      }
      yumrepo { 'elasticsearch':
        descr    => 'elasticsearch repo',
        baseurl  => "http://packages.elastic.co/elasticsearch/${elasticsearch::repo_version}/centos",
        gpgcheck => 1,
        gpgkey   => $::elasticsearch::repo_key_source,
        enabled  => 1,
        proxy    => $::elasticsearch::repo_proxy,
        priority => $elasticsearch::repo_priority,
      } ~>
      exec { 'elasticsearch_yumrepo_yum_clean':
        command     => 'yum clean metadata expire-cache --disablerepo="*" --enablerepo="elasticsearch"',
        refreshonly => true,
        returns     => [0, 1],
      }
    }
    'Suse': {
      if $::operatingsystem == 'SLES' and versioncmp($::operatingsystemmajrelease, '11') <= 0 {
        # Older versions of SLES do not ship with rpmkeys
        $_import_cmd = "rpm --import ${::elasticsearch::repo_key_source}"
      } else {
        $_import_cmd = "rpmkeys --import ${::elasticsearch::repo_key_source}"
      }

      exec { 'elasticsearch_suse_import_gpg':
        command => $_import_cmd,
        unless  =>
          "test $(rpm -qa gpg-pubkey | grep -i 'D88E42B4' | wc -l) -eq 1",
        notify  => Zypprepo['elasticsearch'],
      }

      zypprepo { 'elasticsearch':
        baseurl     => "http://packages.elastic.co/elasticsearch/${elasticsearch::repo_version}/centos",
        enabled     => 1,
        autorefresh => 1,
        name        => 'elasticsearch',
        gpgcheck    => 1,
        gpgkey      => $::elasticsearch::repo_key_source,
        type        => 'yum',
      } ~>
      exec { 'elasticsearch_zypper_refresh_elasticsearch':
        command     => 'zypper refresh elasticsearch',
        refreshonly => true,
      }
    }
    default: {
      fail("\"${module_name}\" provides no repository information for OSfamily \"${::osfamily}\"")
    }
  }

}
