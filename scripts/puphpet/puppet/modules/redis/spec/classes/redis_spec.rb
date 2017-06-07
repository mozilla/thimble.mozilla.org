require 'spec_helper'

describe 'redis', :type => :class do

  on_supported_os.each do |os, facts|
    context "on #{os}" do
      let(:facts) { facts }

      let(:package_name) { manifest_vars[:package_name] }
      let(:service_name) { manifest_vars[:service_name] }
      let(:config_file_orig) { manifest_vars[:config_file_orig] }

      describe 'without parameters' do
        it { is_expected.to create_class('redis') }
        it { is_expected.to contain_class('redis::preinstall') }
        it { is_expected.to contain_class('redis::install') }
        it { is_expected.to contain_class('redis::config') }
        it { is_expected.to contain_class('redis::service') }

        it { is_expected.to contain_package(package_name).with_ensure('present') }

        it { is_expected.to contain_file(config_file_orig).with_ensure('present') }

        it { is_expected.to contain_file(config_file_orig).without_content(/undef/) }

        it do
          is_expected.to contain_service(service_name).with(
            'ensure'     => 'running',
            'enable'     => 'true',
            'hasrestart' => 'true',
            'hasstatus'  => 'true'
          )
        end

        case facts[:operatingsystem]
          when 'Debian'

          context 'on Debian' do

            it do
              is_expected.to contain_file('/var/run/redis').with({
                :ensure => 'directory',
                :owner  => 'redis',
                :group  => 'root',
                :mode   => '0755',
              })
            end

          end

        when 'Ubuntu'

          it do
            is_expected.to contain_file('/var/run/redis').with({
              :ensure => 'directory',
              :owner  => 'redis',
              :group  => 'root',
              :mode   => '0755',
            })
          end

        end
      end

      describe 'with parameter activerehashing' do
        let (:params) {
          {
            :activerehashing => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with_content(/activerehashing.*yes/) }
      end

      describe 'with parameter aof_load_truncated' do
        let (:params) {
          {
            :aof_load_truncated => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with_content(/aof-load-truncated.*yes/) }
      end

      describe 'with parameter aof_rewrite_incremental_fsync' do
        let (:params) {
          {
            :aof_rewrite_incremental_fsync => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with_content(/aof-rewrite-incremental-fsync.*yes/) }
      end

      describe 'with parameter appendfilename' do
        let (:params) {
          {
            :appendfilename => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with_content(/appendfilename.*_VALUE_/) }
      end

      describe 'with parameter appendfsync' do
        let (:params) {
          {
            :appendfsync => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with_content(/appendfsync.*_VALUE_/) }
      end

      describe 'with parameter appendonly' do
        let (:params) {
          {
            :appendonly => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with_content(/appendonly.*yes/) }
      end

      describe 'with parameter auto_aof_rewrite_min_size' do
        let (:params) {
          {
            :auto_aof_rewrite_min_size => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with_content(/auto-aof-rewrite-min-size.*_VALUE_/) }
      end

      describe 'with parameter auto_aof_rewrite_percentage' do
        let (:params) {
          {
            :auto_aof_rewrite_percentage => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with_content(/auto-aof-rewrite-percentage.*_VALUE_/) }
      end

      describe 'with parameter bind' do
        let (:params) {
          {
            :bind => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with_content(/bind.*_VALUE_/) }
      end

      describe 'with parameter: config_dir' do
        let (:params) { { :config_dir => '_VALUE_' } }

        it { is_expected.to contain_file('_VALUE_').with_ensure('directory') }
      end

      describe 'with parameter: config_dir_mode' do
        let (:params) { { :config_dir_mode => '_VALUE_' } }

        it { is_expected.to contain_file('/etc/redis').with_mode('_VALUE_') }
      end

      describe 'with parameter: log_dir_mode' do
        let (:params) { { :log_dir_mode => '_VALUE_' } }

        it { is_expected.to contain_file('/var/log/redis').with_mode('_VALUE_') }
      end

      describe 'with parameter: config_file_orig' do
        let (:params) { { :config_file_orig => '_VALUE_' } }

        it { is_expected.to contain_file('_VALUE_') }
      end

      describe 'with parameter: config_file_mode' do
        let (:params) { { :config_file_mode => '_VALUE_' } }

        it { is_expected.to contain_file(config_file_orig).with_mode('_VALUE_') }
      end

      describe 'with parameter: config_group' do
        let (:params) { { :config_group => '_VALUE_' } }

        it { is_expected.to contain_file('/etc/redis').with_group('_VALUE_') }
      end

      describe 'with parameter: config_owner' do
        let (:params) { { :config_owner => '_VALUE_' } }

        it { is_expected.to contain_file('/etc/redis').with_owner('_VALUE_') }
      end

      describe 'with parameter daemonize' do
        let (:params) {
          {
            :daemonize => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /daemonize.*yes/
          )
        }
      end

      describe 'with parameter databases' do
        let (:params) {
          {
            :databases => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /databases.*_VALUE_/
          )
        }
      end

      describe 'with parameter dbfilename' do
        let (:params) {
          {
            :dbfilename => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /dbfilename.*_VALUE_/
          )
        }
      end

      describe 'without parameter dbfilename' do
        let(:params) {
          {
            :dbfilename => false,
          }
        }

         it { is_expected.to contain_file(config_file_orig).without_content(/^dbfilename/) }
       end

      describe 'with parameter hash_max_ziplist_entries' do
        let (:params) {
          {
            :hash_max_ziplist_entries => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /hash-max-ziplist-entries.*_VALUE_/
          )
        }
      end

      describe 'with parameter hash_max_ziplist_value' do
        let (:params) {
          {
            :hash_max_ziplist_value => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /hash-max-ziplist-value.*_VALUE_/
          )
        }
      end

      describe 'with parameter list_max_ziplist_entries' do
        let (:params) {
          {
            :list_max_ziplist_entries => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /list-max-ziplist-entries.*_VALUE_/
          )
        }
      end

      describe 'with parameter list_max_ziplist_value' do
        let (:params) {
          {
            :list_max_ziplist_value => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /list-max-ziplist-value.*_VALUE_/
          )
        }
      end

      describe 'with parameter log_dir' do
        let (:params) {
          {
            :log_dir => '_VALUE_'
          }
        }

        it { is_expected.to contain_file('_VALUE_').with(
            'ensure' => 'directory'
          )
        }
      end

      describe 'with parameter log_file' do
        let (:params) {
          {
            :log_file => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /logfile.*_VALUE_/
          )
        }
      end

      describe 'with parameter log_level' do
        let (:params) {
          {
            :log_level => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /loglevel.*_VALUE_/
          )
        }
      end

      describe 'with parameter: manage_repo' do
        let (:params) { { :manage_repo => true } }

        case facts[:operatingsystem]

        when 'Debian'

          context 'on Debian' do

            it do
              is_expected.to create_apt__source('dotdeb').with({
                :location => 'http://packages.dotdeb.org/',
                :release  =>  facts[:lsbdistcodename],
                :repos    => 'all',
                :key      => {
                  "id"=>"6572BBEF1B5FF28B28B706837E3F070089DF5277",
                  "source"=>"http://www.dotdeb.org/dotdeb.gpg"
                },
                :include  => { 'src' => true },
              })
            end

          end

        when 'Ubuntu'

          let(:ppa_repo) { manifest_vars[:ppa_repo] }

          it { is_expected.to contain_apt__ppa(ppa_repo) }

        when 'RedHat', 'CentOS', 'Scientific', 'OEL', 'Amazon'

          it { is_expected.to contain_class('epel') }

        end
      end

      describe 'with parameter unixsocket' do
        let (:params) {
          {
            :unixsocket => '/tmp/redis.sock'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /unixsocket.*\/tmp\/redis.sock/
          )
        }
      end

      describe 'with parameter unixsocketperm' do
        let (:params) {
          {
            :unixsocketperm => '777'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /unixsocketperm.*777/
          )
        }
      end

      describe 'with parameter masterauth' do
        let (:params) {
          {
            :masterauth => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /masterauth.*_VALUE_/
          )
        }
      end

      describe 'with parameter maxclients' do
        let (:params) {
          {
            :maxclients => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /maxclients.*_VALUE_/
          )
        }
      end

      describe 'with parameter maxmemory' do
        let (:params) {
          {
            :maxmemory => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /maxmemory.*_VALUE_/
          )
        }
      end

      describe 'with parameter maxmemory_policy' do
        let (:params) {
          {
            :maxmemory_policy => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /maxmemory-policy.*_VALUE_/
          )
        }
      end

      describe 'with parameter maxmemory_samples' do
        let (:params) {
          {
            :maxmemory_samples => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /maxmemory-samples.*_VALUE_/
          )
        }
      end

      describe 'with parameter min_slaves_max_lag' do
        let (:params) {
          {
            :min_slaves_max_lag => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /min-slaves-max-lag.*_VALUE_/
          )
        }
      end

      describe 'with parameter min_slaves_to_write' do
        let (:params) {
          {
            :min_slaves_to_write => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /min-slaves-to-write.*_VALUE_/
          )
        }
      end

      describe 'with parameter notify_keyspace_events' do
        let (:params) {
          {
            :notify_keyspace_events => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /notify-keyspace-events.*_VALUE_/
          )
        }
      end

      describe 'with parameter notify_service' do
        let (:params) {
          {
            :notify_service => true
          }
        }

        let(:service_name) { manifest_vars[:service_name] }

        it { is_expected.to contain_file(config_file_orig).that_notifies("Service[#{service_name}]") }
      end

      describe 'with parameter no_appendfsync_on_rewrite' do
        let (:params) {
          {
            :no_appendfsync_on_rewrite => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /no-appendfsync-on-rewrite.*yes/
          )
        }
      end

      describe 'with parameter: package_ensure' do
        let (:params) { { :package_ensure => '_VALUE_' } }
        let(:package_name) { manifest_vars[:package_name] }

        it { is_expected.to contain_package(package_name).with(
            'ensure' => '_VALUE_'
          )
        }
      end

      describe 'with parameter: package_name' do
        let (:params) { { :package_name => '_VALUE_' } }

        it { is_expected.to contain_package('_VALUE_') }
      end

      describe 'with parameter pid_file' do
        let (:params) {
          {
            :pid_file => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /pidfile.*_VALUE_/
          )
        }
      end

      describe 'with parameter port' do
        let (:params) {
          {
            :port => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /port.*_VALUE_/
          )
        }
      end

      describe 'with parameter hll_sparse_max_bytes' do
        let (:params) {
          {
            :hll_sparse_max_bytes=> '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /hll-sparse-max-bytes.*_VALUE_/
          )
        }
      end

      describe 'with parameter hz' do
        let (:params) {
          {
            :hz=> '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /hz.*_VALUE_/
          )
        }
      end

      describe 'with parameter latency_monitor_threshold' do
        let (:params) {
          {
            :latency_monitor_threshold=> '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /latency-monitor-threshold.*_VALUE_/
          )
        }
      end

      describe 'with parameter rdbcompression' do
        let (:params) {
          {
            :rdbcompression => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /rdbcompression.*yes/
          )
        }
      end

      describe 'with parameter repl_backlog_size' do
        let (:params) {
          {
            :repl_backlog_size => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /repl-backlog-size.*_VALUE_/
          )
        }
      end

      describe 'with parameter repl_backlog_ttl' do
        let (:params) {
          {
            :repl_backlog_ttl => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /repl-backlog-ttl.*_VALUE_/
          )
        }
      end

      describe 'with parameter repl_disable_tcp_nodelay' do
        let (:params) {
          {
            :repl_disable_tcp_nodelay => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /repl-disable-tcp-nodelay.*yes/
          )
        }
      end

      describe 'with parameter repl_ping_slave_period' do
        let (:params) {
          {
            :repl_ping_slave_period => 1
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /repl-ping-slave-period.*1/
          )
        }
      end

      describe 'with parameter repl_timeout' do
        let (:params) {
          {
            :repl_timeout => 1
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /repl-timeout.*1/
          )
        }
      end

      describe 'with parameter requirepass' do
        let (:params) {
          {
            :requirepass => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /requirepass.*_VALUE_/
          )
        }
      end

      describe 'with parameter save_db_to_disk' do
        context 'true' do
          let (:params) {
            {
              :save_db_to_disk => true
            }
          }

          it { is_expected.to contain_file(config_file_orig).with(
              'content' => /^save/
            )
          }
        end

        context 'false' do
          let (:params) {
            {
              :save_db_to_disk => false
            }
          }

          it { is_expected.to contain_file(config_file_orig).with(
              'content' => /^(?!save)/
            )
          }
        end
      end

      describe 'with parameter save_db_to_disk_interval' do
        context 'with save_db_to_disk true' do

          context 'default' do
            let (:params) {
              {
                :save_db_to_disk => true
              }
            }

            it { is_expected.to contain_file(config_file_orig).with('content' => /save 900 1/)}
            it { is_expected.to contain_file(config_file_orig).with('content' => /save 300 10/)}
            it { is_expected.to contain_file(config_file_orig).with('content' => /save 60 10000/)
            }
          end

          context 'default' do
            let (:params) {
              {
                :save_db_to_disk => true,
                :save_db_to_disk_interval => {'900' =>'2', '300' => '11', '60' => '10011'}
              }
            }

            it { is_expected.to contain_file(config_file_orig).with('content' => /save 900 2/)}
            it { is_expected.to contain_file(config_file_orig).with('content' => /save 300 11/)}
            it { is_expected.to contain_file(config_file_orig).with('content' => /save 60 10011/)
            }
          end

        end

        context 'with save_db_to_disk false' do
          context 'default' do
            let (:params) {
              {
                :save_db_to_disk => false
              }
            }

            it { is_expected.to contain_file(config_file_orig).without('content' => /save 900 1/) }
            it { is_expected.to contain_file(config_file_orig).without('content' => /save 300 10/) }
            it { is_expected.to contain_file(config_file_orig).without('content' => /save 60 10000/) }
          end
        end
      end

      describe 'with parameter: service_manage (set to false)' do
        let (:params) { { :service_manage => false } }
        let(:package_name) { manifest_vars[:package_name] }

        it { should_not contain_service(package_name) }
      end

      describe 'with parameter: service_enable' do
        let (:params) { { :service_enable => true } }
        let(:package_name) { manifest_vars[:package_name] }

        it { is_expected.to contain_service(package_name).with_enable(true) }
      end

      describe 'with parameter: service_ensure' do
        let (:params) { { :service_ensure => '_VALUE_' } }
        let(:package_name) { manifest_vars[:package_name] }

        it { is_expected.to contain_service(package_name).with_ensure('_VALUE_') }
      end

      describe 'with parameter: service_group' do
        let (:params) { { :service_group => '_VALUE_' } }

        it { is_expected.to contain_file('/var/log/redis').with_group('_VALUE_') }
      end

      describe 'with parameter: service_hasrestart' do
        let (:params) { { :service_hasrestart => true } }
        let(:package_name) { manifest_vars[:package_name] }

        it { is_expected.to contain_service(package_name).with_hasrestart(true) }
      end

      describe 'with parameter: service_hasstatus' do
        let (:params) { { :service_hasstatus => true } }
        let(:package_name) { manifest_vars[:package_name] }

        it { is_expected.to contain_service(package_name).with_hasstatus(true) }
      end

      describe 'with parameter: service_name' do
        let (:params) { { :service_name => '_VALUE_' } }

        it { is_expected.to contain_service('_VALUE_').with_name('_VALUE_') }
      end

      describe 'with parameter: service_user' do
        let (:params) { { :service_user => '_VALUE_' } }

        it { is_expected.to contain_file('/var/log/redis').with_owner('_VALUE_') }
      end

      describe 'with parameter set_max_intset_entries' do
        let (:params) {
          {
            :set_max_intset_entries => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /set-max-intset-entries.*_VALUE_/
          )
        }
      end

      describe 'with parameter slave_priority' do
        let (:params) {
          {
            :slave_priority => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /slave-priority.*_VALUE_/
          )
        }
      end

      describe 'with parameter slave_read_only' do
        let (:params) {
          {
            :slave_read_only => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /slave-read-only.*yes/
          )
        }
      end

      describe 'with parameter slave_serve_stale_data' do
        let (:params) {
          {
            :slave_serve_stale_data => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /slave-serve-stale-data.*yes/
          )
        }
      end

      describe 'with parameter: slaveof' do
        context 'binding to localhost' do
          let (:params) {
            {
              :bind    => '127.0.0.1',
              :slaveof => '_VALUE_'
            }
          }

          it do
            expect {
              is_expected.to create_class('redis')
            }.to raise_error(Puppet::Error, /Replication is not possible/)
          end
        end

        context 'binding to external ip' do
          let (:params) {
            {
              :bind    => '10.0.0.1',
              :slaveof => '_VALUE_'
            }
          }

          it { is_expected.to contain_file(config_file_orig).with(
            'content' => /^slaveof _VALUE_/
          )
        }
        end
      end

      describe 'with parameter slowlog_log_slower_than' do
        let (:params) {
          {
            :slowlog_log_slower_than => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /slowlog-log-slower-than.*_VALUE_/
          )
        }
      end

      describe 'with parameter slowlog_max_len' do
        let (:params) {
          {
            :slowlog_max_len => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /slowlog-max-len.*_VALUE_/
          )
        }
      end

      describe 'with parameter stop_writes_on_bgsave_error' do
        let (:params) {
          {
            :stop_writes_on_bgsave_error => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /stop-writes-on-bgsave-error.*yes/
          )
        }
      end

      describe 'with parameter syslog_enabled' do
        let (:params) {
          {
            :syslog_enabled => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /syslog-enabled yes/
          )
        }
      end

      describe 'with parameter syslog_facility' do
        let (:params) {
          {
            :syslog_enabled => true,
            :syslog_facility => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /syslog-facility.*_VALUE_/
          )
        }
      end

      describe 'with parameter tcp_backlog' do
        let (:params) {
          {
            :tcp_backlog=> '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /tcp-backlog.*_VALUE_/
          )
        }
      end

      describe 'with parameter tcp_keepalive' do
        let (:params) {
          {
            :tcp_keepalive => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /tcp-keepalive.*_VALUE_/
          )
        }
      end

      describe 'with parameter timeout' do
        let (:params) {
          {
            :timeout => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /timeout.*_VALUE_/
          )
        }
      end

      describe 'with parameter workdir' do
        let (:params) {
          {
            :workdir => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /dir.*_VALUE_/
          )
        }
      end

      describe 'with parameter zset_max_ziplist_entries' do
        let (:params) {
          {
            :zset_max_ziplist_entries => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /zset-max-ziplist-entries.*_VALUE_/
          )
        }
      end

      describe 'with parameter zset_max_ziplist_value' do
        let (:params) {
          {
            :zset_max_ziplist_value => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /zset-max-ziplist-value.*_VALUE_/
          )
        }
      end

      describe 'with parameter cluster_enabled-false' do
        let (:params) {
          {
            :cluster_enabled => false
          }
        }

        it { should_not contain_file(config_file_orig).with(
            'content' => /cluster-enabled/
          )
        }
      end

      describe 'with parameter cluster_enabled-true' do
        let (:params) {
          {
            :cluster_enabled => true
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /cluster-enabled.*yes/
          )
        }
      end

      describe 'with parameter cluster_config_file' do
        let (:params) {
          {
            :cluster_enabled => true,
            :cluster_config_file => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /cluster-config-file.*_VALUE_/
          )
        }
      end

      describe 'with parameter cluster_config_file' do
        let (:params) {
          {
            :cluster_enabled => true,
            :cluster_node_timeout => '_VALUE_'
          }
        }

        it { is_expected.to contain_file(config_file_orig).with(
            'content' => /cluster-node-timeout.*_VALUE_/
          )
        }
      end


    end
  end

end

