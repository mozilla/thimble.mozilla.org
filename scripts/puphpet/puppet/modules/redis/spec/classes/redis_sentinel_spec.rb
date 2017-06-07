require 'spec_helper'

$expected_noparams_content = <<EOF
port 26379
dir /tmp
daemonize yes
pidfile /var/run/redis/redis-sentinel.pid

sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 30000
sentinel parallel-syncs mymaster 1
sentinel failover-timeout mymaster 180000

logfile /var/log/redis/redis.log
EOF

$expected_params_content = <<EOF
bind 1.2.3.4
port 26379
dir /tmp
daemonize yes
pidfile /var/run/redis/redis-sentinel.pid

sentinel monitor cow 127.0.0.1 6379 2
sentinel down-after-milliseconds cow 6000
sentinel parallel-syncs cow 1
sentinel failover-timeout cow 28000
sentinel auth-pass cow password
sentinel notification-script cow bar.sh
sentinel client-reconfig-script cow foo.sh

logfile /tmp/barn-sentinel.log
EOF

describe 'redis::sentinel', :type => :class do
  let (:facts) { debian_facts }

  let :pre_condition do
    [
     'class { redis: }'
    ]
  end

  describe 'without parameters' do

    it { should create_class('redis::sentinel') }

    it { should contain_file('/etc/redis/redis-sentinel.conf.puppet').with(
        'ensure'  => 'present',
        'mode'    => '0644',
        'owner'   => 'redis',
        'content' => $expected_noparams_content
      )
    }

    it { should contain_service('redis-sentinel').with(
        'ensure'     => 'running',
        'enable'     => 'true',
        'hasrestart' => 'true',
        'hasstatus'  => 'true',
      )
    }

  end

  describe 'with custom parameters' do
    let (:params) {
      {
        :auth_pass              => 'password',
        :sentinel_bind          => '1.2.3.4',
        :master_name            => 'cow',
        :down_after             => 6000,
        :log_file               => '/tmp/barn-sentinel.log',
        :failover_timeout       => 28000,
        :notification_script    => 'bar.sh',
        :client_reconfig_script => 'foo.sh'
      }
    }

    it { should create_class('redis::sentinel') }

    it { should contain_file('/etc/redis/redis-sentinel.conf.puppet').with(
        'content' => $expected_params_content
      )
    }
  end

end
