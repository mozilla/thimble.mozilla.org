# == Define: elasticsearch::shield::user
#
# Manages shield users.
#
# === Parameters
#
# [*ensure*]
#   Whether the user should be present or not.
#   Set to 'absent' to ensure a user is not installed
#   Value type is string
#   Default value: present
#   This variable is optional
#
# [*password*]
#   Password for the given user. A plaintext password will be managed
#   with the esusers utility and requires a refresh to update, while
#   a hashed password from the esusers utility will be managed manually
#   in the uses file.
#   Value type is string
#   Default value: undef
#
# [*roles*]
#   A list of roles to which the user should belong.
#   Value type is array
#   Default value: []
#
# === Examples
#
# # Creates and manages a user with membership in the 'logstash'
# # and 'kibana4' roles.
# elasticsearch::shield::user { 'bob':
#   password => 'foobar',
#   roles    => ['logstash', 'kibana4'],
# }
#
# === Authors
#
# * Tyler Langlois <mailto:tyler@elastic.co>
#
define elasticsearch::shield::user (
  $password,
  $ensure = 'present',
  $roles  = [],
) {
  validate_string($ensure, $password)
  validate_array($roles)

  if $password =~ /^\$2a\$/ {
    elasticsearch_shield_user { $name:
      ensure          => $ensure,
      hashed_password => $password,
    }
  } else {
    elasticsearch_shield_user { $name:
      ensure   => $ensure,
      password => $password,
      provider => 'esusers',
    }
  }

  elasticsearch_shield_user_roles { $name:
    ensure => $ensure,
    roles  => $roles,
  }
}
