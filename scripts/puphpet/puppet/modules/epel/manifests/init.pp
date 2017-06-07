# Class epel
#
# Actions:
#   Configure the proper repositories and import GPG keys
#
# Reqiures:
#   You should probably be on an Enterprise Linux variant. (Centos, RHEL,
#   Scientific, Oracle, Ascendos, et al)
#
# Sample Usage:
#  include epel
#
class epel (
  $epel_mirrorlist                        = $epel::params::epel_mirrorlist,
  $epel_baseurl                           = $epel::params::epel_baseurl,
  $epel_failovermethod                    = $epel::params::epel_failovermethod,
  $epel_proxy                             = $epel::params::epel_proxy,
  $epel_enabled                           = $epel::params::epel_enabled,
  $epel_gpgcheck                          = $epel::params::epel_gpgcheck,
  $epel_exclude                           = undef,
  $epel_includepkgs                       = undef,
  $epel_testing_baseurl                   = $epel::params::epel_testing_baseurl,
  $epel_testing_failovermethod            = $epel::params::epel_testing_failovermethod,
  $epel_testing_proxy                     = $epel::params::epel_testing_proxy,
  $epel_testing_enabled                   = $epel::params::epel_testing_enabled,
  $epel_testing_gpgcheck                  = $epel::params::epel_testing_gpgcheck,
  $epel_testing_exclude                   = undef,
  $epel_testing_includepkgs               = undef,
  $epel_source_mirrorlist                 = $epel::params::epel_source_mirrorlist,
  $epel_source_baseurl                    = $epel::params::epel_source_baseurl,
  $epel_source_failovermethod             = $epel::params::epel_source_failovermethod,
  $epel_source_proxy                      = $epel::params::epel_source_proxy,
  $epel_source_enabled                    = $epel::params::epel_source_enabled,
  $epel_source_gpgcheck                   = $epel::params::epel_source_gpgcheck,
  $epel_source_exclude                    = undef,
  $epel_source_includepkgs                = undef,
  $epel_debuginfo_mirrorlist              = $epel::params::epel_debuginfo_mirrorlist,
  $epel_debuginfo_baseurl                 = $epel::params::epel_debuginfo_baseurl,
  $epel_debuginfo_failovermethod          = $epel::params::epel_debuginfo_failovermethod,
  $epel_debuginfo_proxy                   = $epel::params::epel_debuginfo_proxy,
  $epel_debuginfo_enabled                 = $epel::params::epel_debuginfo_enabled,
  $epel_debuginfo_gpgcheck                = $epel::params::epel_debuginfo_gpgcheck,
  $epel_debuginfo_exclude                 = undef,
  $epel_debuginfo_includepkgs             = undef,
  $epel_testing_source_baseurl            = $epel::params::epel_testing_source_baseurl,
  $epel_testing_source_failovermethod     = $epel::params::epel_testing_source_failovermethod,
  $epel_testing_source_proxy              = $epel::params::epel_testing_source_proxy,
  $epel_testing_source_enabled            = $epel::params::epel_testing_source_enabled,
  $epel_testing_source_gpgcheck           = $epel::params::epel_testing_source_gpgcheck,
  $epel_testing_source_exclude            = undef,
  $epel_testing_source_includepkgs        = undef,
  $epel_testing_debuginfo_baseurl         = $epel::params::epel_testing_debuginfo_baseurl,
  $epel_testing_debuginfo_failovermethod  = $epel::params::epel_testing_debuginfo_failovermethod,
  $epel_testing_debuginfo_proxy           = $epel::params::epel_testing_debuginfo_proxy,
  $epel_testing_debuginfo_enabled         = $epel::params::epel_testing_debuginfo_enabled,
  $epel_testing_debuginfo_gpgcheck        = $epel::params::epel_testing_debuginfo_gpgcheck,
  $epel_testing_debuginfo_exclude         = undef,
  $epel_testing_debuginfo_includepkgs     = undef,
  $os_maj_release                         = $epel::params::os_maj_release,
) inherits epel::params {

  if "${::osfamily}" == 'RedHat' and "${::operatingsystem}" !~ /Fedora|Amazon/ { # lint:ignore:only_variable_string
    yumrepo { 'epel-testing':
      baseurl        => $epel_testing_baseurl,
      failovermethod => $epel_testing_failovermethod,
      proxy          => $epel_testing_proxy,
      enabled        => $epel_testing_enabled,
      gpgcheck       => $epel_testing_gpgcheck,
      gpgkey         => "file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-${os_maj_release}",
      descr          => "Extra Packages for Enterprise Linux ${os_maj_release} - Testing - \$basearch ",
      exclude        => $epel_testing_exclude,
      includepkgs    => $epel_testing_includepkgs,
    }

    yumrepo { 'epel-testing-debuginfo':
      baseurl        => $epel_testing_debuginfo_baseurl,
      failovermethod => $epel_testing_debuginfo_failovermethod,
      proxy          => $epel_testing_debuginfo_proxy,
      enabled        => $epel_testing_debuginfo_enabled,
      gpgcheck       => $epel_testing_debuginfo_gpgcheck,
      gpgkey         => "file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-${os_maj_release}",
      descr          => "Extra Packages for Enterprise Linux ${os_maj_release} - Testing - \$basearch - Debug",
      exclude        => $epel_testing_debuginfo_exclude,
      includepkgs    => $epel_testing_debuginfo_includepkgs,
    }

    yumrepo { 'epel-testing-source':
      baseurl        => $epel_testing_source_baseurl,
      failovermethod => $epel_testing_source_failovermethod,
      proxy          => $epel_testing_source_proxy,
      enabled        => $epel_testing_source_enabled,
      gpgcheck       => $epel_testing_source_gpgcheck,
      gpgkey         => "file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-${os_maj_release}",
      descr          => "Extra Packages for Enterprise Linux ${os_maj_release} - Testing - \$basearch - Source",
      exclude        => $epel_testing_source_exclude,
      includepkgs    => $epel_testing_source_includepkgs,
    }

    yumrepo { 'epel':
      # lint:ignore:selector_inside_resource
      mirrorlist     => $epel_baseurl ? {
        'absent' => $epel_mirrorlist,
        default  => 'absent',
      },
      # lint:endignore
      baseurl        => $epel_baseurl,
      failovermethod => $epel_failovermethod,
      proxy          => $epel_proxy,
      enabled        => $epel_enabled,
      gpgcheck       => $epel_gpgcheck,
      gpgkey         => "file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-${os_maj_release}",
      descr          => "Extra Packages for Enterprise Linux ${os_maj_release} - \$basearch",
      exclude        => $epel_exclude,
      includepkgs    => $epel_includepkgs,
    }

    yumrepo { 'epel-debuginfo':
      # lint:ignore:selector_inside_resource
      mirrorlist     => $epel_debuginfo_baseurl ? {
        'absent' => $epel_debuginfo_mirrorlist,
        default  => 'absent',
      },
      # lint:endignore
      baseurl        => $epel_debuginfo_baseurl,
      failovermethod => $epel_debuginfo_failovermethod,
      proxy          => $epel_debuginfo_proxy,
      enabled        => $epel_debuginfo_enabled,
      gpgcheck       => $epel_debuginfo_gpgcheck,
      gpgkey         => "file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-${os_maj_release}",
      descr          => "Extra Packages for Enterprise Linux ${os_maj_release} - \$basearch - Debug",
      exclude        => $epel_debuginfo_exclude,
      includepkgs    => $epel_debuginfo_includepkgs,
    }

    yumrepo { 'epel-source':
      # lint:ignore:selector_inside_resource
      mirrorlist     => $epel_source_baseurl ? {
        'absent' => $epel_source_mirrorlist,
        default  => 'absent',
      },
      # lint:endignore
      baseurl        => $epel_source_baseurl,
      failovermethod => $epel_source_failovermethod,
      proxy          => $epel_source_proxy,
      enabled        => $epel_source_enabled,
      gpgcheck       => $epel_source_gpgcheck,
      gpgkey         => "file:///etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-${os_maj_release}",
      descr          => "Extra Packages for Enterprise Linux ${os_maj_release} - \$basearch - Source",
      exclude        => $epel_source_exclude,
      includepkgs    => $epel_source_includepkgs,
    }

    file { "/etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-${os_maj_release}":
      ensure => present,
      owner  => 'root',
      group  => 'root',
      mode   => '0644',
      source => "puppet:///modules/epel/RPM-GPG-KEY-EPEL-${os_maj_release}",
    }

    epel::rpm_gpg_key{ "EPEL-${os_maj_release}":
      path   => "/etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-${os_maj_release}",
      before => Yumrepo['epel','epel-source','epel-debuginfo','epel-testing','epel-testing-source','epel-testing-debuginfo'],
    }

  } elsif "${::osfamily}" == 'RedHat' and "${::operatingsystem}" == 'Amazon' { # lint:ignore:only_variable_string
    yumrepo { 'epel':
      enabled  => $epel_enabled,
      gpgcheck => $epel_gpgcheck,
    }
  } else {
    notice ("Your operating system ${::operatingsystem} will not have the EPEL repository applied")
  }
}
