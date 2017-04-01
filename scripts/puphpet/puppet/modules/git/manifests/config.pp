# == Define: git::config
#
# Used to configure git
#
# === Parameters
#
# [*value*]
#   The config value. Example: Mike Color or john.doe@example.com.
#   See examples below.
#
# [*key*]
#   The name of the option to be set. Example: user.email.
#   Default value: same as resource name.
#
# [*user*]
#   The user for which the config will be set. Default value: root
#
# [*scope*]
#   The scope of the configuration, can be system or global.
#   Default value: global
#
# === Examples
#
# Provide some examples on how to use this type:
#
#   git::config { 'user.name':
#     value => 'John Doe',
#   }
#
#   git::config { 'user.email':
#     value => 'john.doe@example.com',
#   }
#
#   git::config { 'user.name':
#     value   => 'Mike Color',
#     user    => 'vagrant',
#     require => Class['git'],
#   }
#
#  git::config { 'http.sslCAInfo':
#     value   => $companyCAroot,
#     user    => 'root',
#     scope   => 'system',
#     require => Company::Certificate['companyCAroot'],
#   }
#
# === Authors
#
# === Copyright
#
define git::config (
  $value,
  $key      = $name,
  $section  = undef,
  $user     = 'root',
  $scope    = 'global',
) {
  # Backwards compatibility with deprecated $section parameter.
  # (Old versions took separate $section and $key, e.g. "user" and "email".)
  if $section != undef {
    warning('Parameter `section` is deprecated, supply the full option name (e.g. "user.email") in the `key` parameter')
    $_key = "${section}.${key}"
  } else {
    $_key = $key
  }

  $git_package = $::git::package_manage ? {
    true    => Package[$::git::package_name],
    default => undef,
  }

  git_config { $title:
    key     => $_key,
    value   => $value,
    user    => $user,
    scope   => $scope,
    require => $git_package,
  }
}
