# RVM's GPG key import

class rvm::gnupg_key(
  $key_id = $rvm::params::gnupg_key_id,
  $key_server = $rvm::params::key_server) inherits rvm::params {

  gnupg_key { "rvm_${key_id}":
    ensure     => present,
    key_id     => $key_id,
    user       => 'root',
    key_server => $key_server,
    key_type   => public,
  }

}
