# Private class: See README.md.
class mysql::params {

  $manage_config_file     = true
  $purge_conf_dir         = false
  $restart                = false
  $root_password          = 'UNSET'
  $install_secret_file    = '/.mysql_secret'
  $server_package_ensure  = 'present'
  $server_package_manage  = true
  $server_service_manage  = true
  $server_service_enabled = true
  $client_package_ensure  = 'present'
  $client_package_manage  = true
  $create_root_user       = true
  $create_root_my_cnf     = true
  # mysql::bindings
  $bindings_enable             = false
  $java_package_ensure         = 'present'
  $java_package_provider       = undef
  $perl_package_ensure         = 'present'
  $perl_package_provider       = undef
  $php_package_ensure          = 'present'
  $php_package_provider        = undef
  $python_package_ensure       = 'present'
  $python_package_provider     = undef
  $ruby_package_ensure         = 'present'
  $ruby_package_provider       = undef
  $client_dev_package_ensure   = 'present'
  $client_dev_package_provider = undef
  $daemon_dev_package_ensure   = 'present'
  $daemon_dev_package_provider = undef
  $xtrabackup_package_name     = 'percona-xtrabackup'


  case $::osfamily {
    'RedHat': {
      case $::operatingsystem {
        'Fedora': {
          if versioncmp($::operatingsystemrelease, '19') >= 0 or $::operatingsystemrelease == 'Rawhide' {
            $provider = 'mariadb'
          } else {
            $provider = 'mysql'
          }
        }
        /^(RedHat|CentOS|Scientific|OracleLinux)$/: {
          if versioncmp($::operatingsystemmajrelease, '7') >= 0 {
            $provider = 'mariadb'
          } else {
            $provider = 'mysql'
          }
        }
        default: {
          $provider = 'mysql'
        }
      }

      if $provider == 'mariadb' {
        $client_package_name     = 'mariadb'
        $server_package_name     = 'mariadb-server'
        $server_service_name     = 'mariadb'
        $log_error               = '/var/log/mariadb/mariadb.log'
        $config_file             = '/etc/my.cnf.d/server.cnf'
        # mariadb package by default has !includedir set in my.cnf to /etc/my.cnf.d
        $includedir              = undef
        $pidfile                 = '/var/run/mariadb/mariadb.pid'
        $daemon_dev_package_name = 'mariadb-devel'
      } else {
        $client_package_name     = 'mysql'
        $server_package_name     = 'mysql-server'
        $server_service_name     = 'mysqld'
        $log_error               = '/var/log/mysqld.log'
        $config_file             = '/etc/my.cnf'
        $includedir              = '/etc/my.cnf.d'
        $pidfile                 = '/var/run/mysqld/mysqld.pid'
        $daemon_dev_package_name = 'mysql-devel'
      }

      $basedir                 = '/usr'
      $datadir                 = '/var/lib/mysql'
      $root_group              = 'root'
      $mysql_group             = 'mysql'
      $socket                  = '/var/lib/mysql/mysql.sock'
      $ssl_ca                  = '/etc/mysql/cacert.pem'
      $ssl_cert                = '/etc/mysql/server-cert.pem'
      $ssl_key                 = '/etc/mysql/server-key.pem'
      $tmpdir                  = '/tmp'
      # mysql::bindings
      $java_package_name       = 'mysql-connector-java'
      $perl_package_name       = 'perl-DBD-MySQL'
      $php_package_name        = 'php-mysql'
      $python_package_name     = 'MySQL-python'
      $ruby_package_name       = 'ruby-mysql'
      $client_dev_package_name = undef
    }

    'Suse': {
      case $::operatingsystem {
        'OpenSuSE': {
          if versioncmp( $::operatingsystemmajrelease, '12' ) >= 0 {
            $client_package_name = 'mariadb-client'
            $server_package_name = 'mariadb'
            # First service start fails if this is set. Runs fine without
            # it being set, in any case. Leaving it as-is for the mysql.
            $basedir             = undef
          } else {
            $client_package_name = 'mysql-community-server-client'
            $server_package_name = 'mysql-community-server'
            $basedir             = '/usr'
          }
        }
        'SLES','SLED': {
          if versioncmp($::operatingsystemrelease, '12') >= 0 {
            $client_package_name = 'mariadb-client'
            $server_package_name = 'mariadb'
            $basedir             = undef
          } else {
            $client_package_name = 'mysql-client'
            $server_package_name = 'mysql'
            $basedir             = '/usr'
          }
        }
        default: {
          fail("Unsupported platform: puppetlabs-${module_name} currently doesn't support ${::operatingsystem}")
        }
      }
      $config_file         = '/etc/my.cnf'
      $includedir          = '/etc/my.cnf.d'
      $datadir             = '/var/lib/mysql'
      $log_error           = $::operatingsystem ? {
        /OpenSuSE/         => '/var/log/mysql/mysqld.log',
        /(SLES|SLED)/      => '/var/log/mysqld.log',
      }
      $pidfile             = $::operatingsystem ? {
        /OpenSuSE/         => '/var/run/mysql/mysqld.pid',
        /(SLES|SLED)/      => '/var/lib/mysql/mysqld.pid',
      }
      $root_group          = 'root'
      $mysql_group         = 'mysql'
      $server_service_name = 'mysql'

      if $::operatingsystem =~ /(SLES|SLED)/ {
        if versioncmp( $::operatingsystemmajrelease, '12' ) >= 0 {
          $socket = '/run/mysql/mysql.sock'
        } else {
          $socket = '/var/lib/mysql/mysql.sock'
        }
      } else {
        $socket = '/var/run/mysql/mysql.sock'
      }

      $ssl_ca              = '/etc/mysql/cacert.pem'
      $ssl_cert            = '/etc/mysql/server-cert.pem'
      $ssl_key             = '/etc/mysql/server-key.pem'
      $tmpdir              = '/tmp'
      # mysql::bindings
      $java_package_name   = 'mysql-connector-java'
      $perl_package_name   = 'perl-DBD-mysql'
      $php_package_name    = 'apache2-mod_php53'
      $python_package_name = 'python-mysql'
      $ruby_package_name   = $::operatingsystem ? {
        /OpenSuSE/         => 'rubygem-mysql',
        /(SLES|SLED)/      => 'ruby-mysql',
      }
      $client_dev_package_name = 'libmysqlclient-devel'
      $daemon_dev_package_name = 'mysql-devel'
    }

    'Debian': {
      $client_package_name     = 'mysql-client'
      $server_package_name     = 'mysql-server'

      $basedir                 = '/usr'
      $config_file             = '/etc/mysql/my.cnf'
      $includedir              = '/etc/mysql/conf.d'
      $datadir                 = '/var/lib/mysql'
      $log_error               = '/var/log/mysql/error.log'
      $pidfile                 = '/var/run/mysqld/mysqld.pid'
      $root_group              = 'root'
      $mysql_group             = 'adm'
      $server_service_name     = 'mysql'
      $socket                  = '/var/run/mysqld/mysqld.sock'
      $ssl_ca                  = '/etc/mysql/cacert.pem'
      $ssl_cert                = '/etc/mysql/server-cert.pem'
      $ssl_key                 = '/etc/mysql/server-key.pem'
      $tmpdir                  = '/tmp'
      # mysql::bindings
      $java_package_name   = 'libmysql-java'
      $perl_package_name   = 'libdbd-mysql-perl'
      $php_package_name    = $::lsbdistcodename ? {
        'xenial'           => 'php-mysql',
        default            => 'php5-mysql',
      }
      $python_package_name = 'python-mysqldb'
      $ruby_package_name   = $::lsbdistcodename ? {
        'trusty'           => 'ruby-mysql',
        'jessie'           => 'ruby-mysql',
        'xenial'           => 'ruby-mysql',
        default            => 'libmysql-ruby',
      }
      $client_dev_package_name = 'libmysqlclient-dev'
      $daemon_dev_package_name = 'libmysqld-dev'
    }

    'Archlinux': {
      $client_package_name = 'mariadb-clients'
      $server_package_name = 'mariadb'
      $basedir             = '/usr'
      $config_file         = '/etc/mysql/my.cnf'
      $datadir             = '/var/lib/mysql'
      $log_error           = '/var/log/mysqld.log'
      $pidfile             = '/var/run/mysqld/mysqld.pid'
      $root_group          = 'root'
      $mysql_group         = 'mysql'
      $server_service_name = 'mysqld'
      $socket              = '/var/lib/mysql/mysql.sock'
      $ssl_ca              = '/etc/mysql/cacert.pem'
      $ssl_cert            = '/etc/mysql/server-cert.pem'
      $ssl_key             = '/etc/mysql/server-key.pem'
      $tmpdir              = '/tmp'
      # mysql::bindings
      $java_package_name   = 'mysql-connector-java'
      $perl_package_name   = 'perl-dbd-mysql'
      $php_package_name    = undef
      $python_package_name = 'mysql-python'
      $ruby_package_name   = 'mysql-ruby'
    }

    'Gentoo': {
      $client_package_name = 'virtual/mysql'
      $server_package_name = 'virtual/mysql'
      $basedir             = '/usr'
      $config_file         = '/etc/mysql/my.cnf'
      $datadir             = '/var/lib/mysql'
      $log_error           = '/var/log/mysql/mysqld.err'
      $pidfile             = '/run/mysqld/mysqld.pid'
      $root_group          = 'root'
      $mysql_group         = 'mysql'
      $server_service_name = 'mysql'
      $socket              = '/run/mysqld/mysqld.sock'
      $ssl_ca              = '/etc/mysql/cacert.pem'
      $ssl_cert            = '/etc/mysql/server-cert.pem'
      $ssl_key             = '/etc/mysql/server-key.pem'
      $tmpdir              = '/tmp'
      # mysql::bindings
      $java_package_name   = 'dev-java/jdbc-mysql'
      $perl_package_name   = 'dev-perl/DBD-mysql'
      $php_package_name    = undef
      $python_package_name = 'dev-python/mysql-python'
      $ruby_package_name   = 'dev-ruby/mysql-ruby'
    }

    'FreeBSD': {
      $client_package_name = 'databases/mysql56-client'
      $server_package_name = 'databases/mysql56-server'
      $basedir             = '/usr/local'
      $config_file         = '/usr/local/etc/my.cnf'
      $includedir          = '/usr/local/etc/my.cnf.d'
      $datadir             = '/var/db/mysql'
      $log_error           = '/var/log/mysqld.log'
      $pidfile             = '/var/run/mysql.pid'
      $root_group          = 'wheel'
      $mysql_group         = 'mysql'
      $server_service_name = 'mysql-server'
      $socket              = '/var/db/mysql/mysql.sock'
      $ssl_ca              = undef
      $ssl_cert            = undef
      $ssl_key             = undef
      $tmpdir              = '/tmp'
      # mysql::bindings
      $java_package_name   = 'databases/mysql-connector-java'
      $perl_package_name   = 'p5-DBD-mysql'
      $php_package_name    = 'php5-mysql'
      $python_package_name = 'databases/py-MySQLdb'
      $ruby_package_name   = 'databases/ruby-mysql'
      # The libraries installed by these packages are included in client and server packages, no installation required.
      $client_dev_package_name     = undef
      $daemon_dev_package_name     = undef
    }

    'OpenBSD': {
      $client_package_name = 'mariadb-client'
      $server_package_name = 'mariadb-server'
      $basedir             = '/usr/local'
      $config_file         = '/etc/my.cnf'
      $includedir          = undef
      $datadir             = '/var/mysql'
      $log_error           = "/var/mysql/${::hostname}.err"
      $pidfile             = '/var/mysql/mysql.pid'
      $root_group          = 'wheel'
      $mysql_group         = '_mysql'
      $server_service_name = 'mysqld'
      $socket              = '/var/run/mysql/mysql.sock'
      $ssl_ca              = undef
      $ssl_cert            = undef
      $ssl_key             = undef
      $tmpdir              = '/tmp'
      # mysql::bindings
      $java_package_name   = undef
      $perl_package_name   = 'p5-DBD-mysql'
      $php_package_name    = 'php-mysql'
      $python_package_name = 'py-mysql'
      $ruby_package_name   = 'ruby-mysql'
      # The libraries installed by these packages are included in client and server packages, no installation required.
      $client_dev_package_name     = undef
      $daemon_dev_package_name     = undef
    }

    'Solaris': {
      $client_package_name = 'database/mysql-55/client'
      $server_package_name = 'database/mysql-55'
      $basedir             = undef
      $config_file         = '/etc/mysql/5.5/my.cnf'
      $datadir             = '/var/mysql/5.5/data'
      $log_error           = "/var/mysql/5.5/data/${::hostname}.err"
      $pidfile             = "/var/mysql/5.5/data/${::hostname}.pid"
      $root_group          = 'bin'
      $server_service_name = 'application/database/mysql:version_55'
      $socket              = '/tmp/mysql.sock'
      $ssl_ca              = undef
      $ssl_cert            = undef
      $ssl_key             = undef
      $tmpdir              = '/tmp'
      # mysql::bindings
      $java_package_name   = undef
      $perl_package_name   = undef
      $php_package_name    = 'web/php-53/extension/php-mysql'
      $python_package_name = 'library/python/python-mysql'
      $ruby_package_name   = undef
      # The libraries installed by these packages are included in client and server packages, no installation required.
      $client_dev_package_name     = undef
      $daemon_dev_package_name     = undef
    }

    default: {
      case $::operatingsystem {
        'Amazon': {
          $client_package_name = 'mysql'
          $server_package_name = 'mysql-server'
          $basedir             = '/usr'
          $config_file         = '/etc/my.cnf'
          $includedir          = '/etc/my.cnf.d'
          $datadir             = '/var/lib/mysql'
          $log_error           = '/var/log/mysqld.log'
          $pidfile             = '/var/run/mysqld/mysqld.pid'
          $root_group          = 'root'
          $mysql_group         = 'mysql'
          $server_service_name = 'mysqld'
          $socket              = '/var/lib/mysql/mysql.sock'
          $ssl_ca              = '/etc/mysql/cacert.pem'
          $ssl_cert            = '/etc/mysql/server-cert.pem'
          $ssl_key             = '/etc/mysql/server-key.pem'
          $tmpdir              = '/tmp'
          # mysql::bindings
          $java_package_name   = 'mysql-connector-java'
          $perl_package_name   = 'perl-DBD-MySQL'
          $php_package_name    = 'php-mysql'
          $python_package_name = 'MySQL-python'
          $ruby_package_name   = 'ruby-mysql'
          # The libraries installed by these packages are included in client and server packages, no installation required.
          $client_dev_package_name     = undef
          $daemon_dev_package_name     = undef
        }

        default: {
          fail("Unsupported platform: puppetlabs-${module_name} currently doesn't support ${::osfamily} or ${::operatingsystem}")
        }
      }
    }
  }

  case $::operatingsystem {
    'Ubuntu': {
      if versioncmp($::operatingsystemmajrelease, '14.10') > 0 {
        $server_service_provider = 'systemd'
      } else {
        $server_service_provider = 'upstart'
      }
    }
    default: {
      $server_service_provider = undef
    }
  }

  $default_options = {
    'client'          => {
      'port'          => '3306',
      'socket'        => $mysql::params::socket,
    },
    'mysqld_safe'        => {
      'nice'             => '0',
      'log-error'        => $mysql::params::log_error,
      'socket'           => $mysql::params::socket,
    },
    'mysqld-5.0'       => {
      'myisam-recover' => 'BACKUP',
    },
    'mysqld-5.1'       => {
      'myisam-recover' => 'BACKUP',
    },
    'mysqld-5.5'       => {
      'myisam-recover' => 'BACKUP',
    },
    'mysqld-5.6'              => {
      'myisam-recover-options' => 'BACKUP',
    },
    'mysqld-5.7'              => {
      'myisam-recover-options' => 'BACKUP',
    },
    'mysqld'                  => {
      'basedir'               => $mysql::params::basedir,
      'bind-address'          => '127.0.0.1',
      'datadir'               => $mysql::params::datadir,
      'expire_logs_days'      => '10',
      'key_buffer_size'       => '16M',
      'log-error'             => $mysql::params::log_error,
      'max_allowed_packet'    => '16M',
      'max_binlog_size'       => '100M',
      'max_connections'       => '151',
      'pid-file'              => $mysql::params::pidfile,
      'port'                  => '3306',
      'query_cache_limit'     => '1M',
      'query_cache_size'      => '16M',
      'skip-external-locking' => true,
      'socket'                => $mysql::params::socket,
      'ssl'                   => false,
      'ssl-ca'                => $mysql::params::ssl_ca,
      'ssl-cert'              => $mysql::params::ssl_cert,
      'ssl-key'               => $mysql::params::ssl_key,
      'ssl-disable'           => false,
      'thread_cache_size'     => '8',
      'thread_stack'          => '256K',
      'tmpdir'                => $mysql::params::tmpdir,
      'user'                  => 'mysql',
    },
    'mysqldump'             => {
      'max_allowed_packet'  => '16M',
      'quick'               => true,
      'quote-names'         => true,
    },
    'isamchk'      => {
      'key_buffer_size' => '16M',
    },
  }

  ## Additional graceful failures
  if $::osfamily == 'RedHat' and $::operatingsystemmajrelease == '4' and $::operatingsystem != 'Amazon' {
    fail("Unsupported platform: puppetlabs-${module_name} only supports RedHat 5.0 and beyond")
  }
}
