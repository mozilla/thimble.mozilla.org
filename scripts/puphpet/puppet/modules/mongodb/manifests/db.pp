# == Class: mongodb::db
#
# Class for creating mongodb databases and users.
#
# == Parameters
#
#  user - Database username.
#  db_name - Database name. Defaults to $name.
#  password_hash - Hashed password. Hex encoded md5 hash of "$username:mongo:$password".
#  password - Plain text user password. This is UNSAFE, use 'password_hash' unstead.
#  roles (default: ['dbAdmin']) - array with user roles.
#  tries (default: 10) - The maximum amount of two second tries to wait MongoDB startup.
#
define mongodb::db (
  $user,
  $db_name       = $name,
  $password_hash = false,
  $password      = false,
  $roles         = ['dbAdmin'],
  $tries         = 10,
) {

  mongodb_database { $db_name:
    ensure => present,
    tries  => $tries
  }

  if $password_hash {
    $hash = $password_hash
  } elsif $password {
    $hash = mongodb_password($user, $password)
  } else {
    fail("Parameter 'password_hash' or 'password' should be provided to mongodb::db.")
  }

  mongodb_user { "User ${user} on db ${db_name}":
    ensure        => present,
    password_hash => $hash,
    username      => $user,
    database      => $db_name,
    roles         => $roles,
    require       => Mongodb_database[$db_name],
  }

}
