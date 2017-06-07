# PRIVATE CLASS: do not use directly
class mongodb::repo::apt inherits mongodb::repo {
  # we try to follow/reproduce the instruction
  # from http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/

  include ::apt

  if($::mongodb::repo::ensure == 'present' or $::mongodb::repo::ensure == true) {
    apt::source { 'mongodb':
      location => $::mongodb::repo::location,
      release  => $::mongodb::repo::release,
      repos    => $::mongodb::repo::repos,
      key      => {
        'id'     => $::mongodb::repo::key,
        'server' => $::mongodb::repo::key_server,
      }
    }

    Apt::Source['mongodb']->Package<|tag == 'mongodb'|>
  }
  else {
    apt::source { 'mongodb':
      ensure => absent,
    }
  }
}
