require 'spec_helper'

describe 'rabbitmq' do

  context 'on unsupported distributions' do
    let(:facts) {{ :osfamily => 'Unsupported' }}

    it 'we fail' do
      expect { catalogue }.to raise_error(Puppet::Error, /not supported on an Unsupported/)
    end
  end

  context 'on Debian' do
    with_debian_facts
    it 'includes rabbitmq::repo::apt' do
      should contain_class('rabbitmq::repo::apt')
    end

    describe 'apt::source default values' do
      it 'should add a repo with defaults values' do
        should contain_apt__source('rabbitmq').with( {
          :ensure   => 'present',
          :location => 'http://www.rabbitmq.com/debian/',
          :release  => 'testing',
          :repos    => 'main',
        })
      end
    end
  end

  context 'on Debian' do
    let(:params) {{ :manage_repos => false }}
    with_debian_facts
    it 'does ensure rabbitmq apt::source is absent when manage_repos is false' do
      should_not contain_apt__source('rabbitmq')
    end
  end

  context 'on Debian' do
    let(:params) {{ :manage_repos => true }}
    with_debian_facts

    it 'includes rabbitmq::repo::apt' do
      should contain_class('rabbitmq::repo::apt')
    end

    describe 'apt::source default values' do
      it 'should add a repo with defaults values' do
        should contain_apt__source('rabbitmq').with( {
          :ensure   => 'present',
          :location => 'http://www.rabbitmq.com/debian/',
          :release  => 'testing',
          :repos    => 'main',
        })
      end
    end
  end

  context 'on Debian' do
    let(:params) {{ :repos_ensure => false }}
    with_debian_facts
    it 'does ensure rabbitmq apt::source is absent when repos_ensure is false' do
      should contain_apt__source('rabbitmq').with(
        'ensure'  => 'absent'
      )
    end
  end

  context 'on Debian' do
    let(:params) {{ :repos_ensure => true }}
    with_debian_facts

    it 'includes rabbitmq::repo::apt' do
      should contain_class('rabbitmq::repo::apt')
    end

    describe 'apt::source default values' do
      it 'should add a repo with defaults values' do
        should contain_apt__source('rabbitmq').with( {
          :ensure   => 'present',
          :location => 'http://www.rabbitmq.com/debian/',
          :release  => 'testing',
          :repos    => 'main',
        })
      end
    end
  end

  context 'on Debian' do
    let(:params) {{ :manage_repos => true, :repos_ensure => false }}
    with_debian_facts

    it 'includes rabbitmq::repo::apt' do
      should contain_class('rabbitmq::repo::apt')
    end

    describe 'apt::source default values' do
      it 'should add a repo with defaults values' do
        should contain_apt__source('rabbitmq').with( {
          :ensure => 'absent',
        })
      end
    end
  end

  context 'on Debian' do
    let(:params) {{ :manage_repos => true, :repos_ensure => true }}
    with_debian_facts

    it 'includes rabbitmq::repo::apt' do
      should contain_class('rabbitmq::repo::apt')
    end

    describe 'apt::source default values' do
      it 'should add a repo with defaults values' do
        should contain_apt__source('rabbitmq').with( {
          :ensure   => 'present',
          :location => 'http://www.rabbitmq.com/debian/',
          :release  => 'testing',
          :repos    => 'main',
        })
      end
    end
  end

  context 'on Debian' do
    let(:params) {{ :manage_repos => false, :repos_ensure => true }}
    with_debian_facts
    it 'does ensure rabbitmq apt::source is absent when manage_repos is false and repos_ensure is true' do
      should_not contain_apt__source('rabbitmq')
    end
  end

  context 'on Debian' do
    with_debian_facts
    context 'with manage_repos => false and repos_ensure => false' do
      let(:params) {{ :manage_repos => false, :repos_ensure => false }}
      it 'does ensure rabbitmq apt::source is absent when manage_repos is false and repos_ensure is false' do
        should_not contain_apt__source('rabbitmq')
      end
    end

    context 'with file_limit => unlimited' do
      let(:params) {{ :file_limit => 'unlimited' }}
      it { should contain_file('/etc/default/rabbitmq-server').with_content(/ulimit -n unlimited/) }
    end

    context 'with file_limit => infinity' do
      let(:params) {{ :file_limit => 'infinity' }}
      it { should contain_file('/etc/default/rabbitmq-server').with_content(/ulimit -n infinity/) }
    end

    context 'with file_limit => \'-1\'' do
      let(:params) {{ :file_limit => '-1' }}
      it { should contain_file('/etc/default/rabbitmq-server').with_content(/ulimit -n -1/) }
    end

    context 'with file_limit => \'1234\'' do
      let(:params) {{ :file_limit => '1234' }}
      it { should contain_file('/etc/default/rabbitmq-server').with_content(/ulimit -n 1234/) }
    end

    context 'with file_limit => 1234' do
      let(:params) {{ :file_limit => 1234 }}
      it { should contain_file('/etc/default/rabbitmq-server').with_content(/ulimit -n 1234/) }
    end

    context 'with file_limit => \'-42\'' do
      let(:params) {{ :file_limit => '-42' }}
      it 'does not compile' do
        expect { catalogue }.to raise_error(Puppet::Error, /\$file_limit must be a positive integer, '-1', 'unlimited', or 'infinity'/)
      end
    end

    context 'with file_limit => \'foo\'' do
      let(:params) {{ :file_limit => 'foo' }}
      it 'does not compile' do
        expect { catalogue }.to raise_error(Puppet::Error, /\$file_limit must be a positive integer, '-1', 'unlimited', or 'infinity'/)
      end
    end
  end

  context 'on Redhat' do
    with_redhat_facts
    it 'includes rabbitmq::repo::rhel' do
      should contain_class('rabbitmq::repo::rhel')
      should contain_exec('rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc')
    end

    context 'with file_limit => \'unlimited\'' do
      let(:params) {{ :file_limit => 'unlimited' }}
      it { should contain_file('/etc/security/limits.d/rabbitmq-server.conf').with(
        'owner'   => '0',
        'group'   => '0',
        'mode'    => '0644',
        'notify'  => 'Class[Rabbitmq::Service]',
        'content' => 'rabbitmq soft nofile unlimited
rabbitmq hard nofile unlimited
'
      ) }
    end

    context 'with file_limit => \'infinity\'' do
      let(:params) {{ :file_limit => 'infinity' }}
      it { should contain_file('/etc/security/limits.d/rabbitmq-server.conf').with(
        'owner'   => '0',
        'group'   => '0',
        'mode'    => '0644',
        'notify'  => 'Class[Rabbitmq::Service]',
        'content' => 'rabbitmq soft nofile infinity
rabbitmq hard nofile infinity
'
      ) }
    end

    context 'with file_limit => \'-1\'' do
      let(:params) {{ :file_limit => '-1' }}
      it { should contain_file('/etc/security/limits.d/rabbitmq-server.conf').with(
        'owner'   => '0',
        'group'   => '0',
        'mode'    => '0644',
        'notify'  => 'Class[Rabbitmq::Service]',
        'content' => 'rabbitmq soft nofile -1
rabbitmq hard nofile -1
'
      ) }
    end

    context 'with file_limit => \'1234\'' do
      let(:params) {{ :file_limit => '1234' }}
      it { should contain_file('/etc/security/limits.d/rabbitmq-server.conf').with(
        'owner'   => '0',
        'group'   => '0',
        'mode'    => '0644',
        'notify'  => 'Class[Rabbitmq::Service]',
        'content' => 'rabbitmq soft nofile 1234
rabbitmq hard nofile 1234
'
      ) }
    end

    context 'with file_limit => \'-42\'' do
      let(:params) {{ :file_limit => '-42' }}
      it 'does not compile' do
        expect { catalogue }.to raise_error(Puppet::Error, /\$file_limit must be a positive integer, '-1', 'unlimited', or 'infinity'/)
      end
    end

    context 'with file_limit => \'foo\'' do
      let(:params) {{ :file_limit => 'foo' }}
      it 'does not compile' do
        expect { catalogue }.to raise_error(Puppet::Error, /\$file_limit must be a positive integer, '-1', 'unlimited', or 'infinity'/)
      end
    end
  end

  context 'on Redhat' do
    let(:params) {{ :repos_ensure => false }}
    with_redhat_facts
    it 'does not import repo public key when repos_ensure is false' do
      should contain_class('rabbitmq::repo::rhel')
      should_not contain_exec('rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc')
    end
  end

  context 'on Redhat' do
    let(:params) {{ :repos_ensure => true }}
    with_redhat_facts
    it 'does import repo public key when repos_ensure is true' do
      should contain_class('rabbitmq::repo::rhel')
      should contain_exec('rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc')
    end
  end

  context 'on Redhat' do
    let(:params) {{ :manage_repos => false }}
    with_redhat_facts
    it 'does not import repo public key when manage_repos is false' do
      should_not contain_class('rabbitmq::repo::rhel')
      should_not contain_exec('rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc')
    end
  end

  context 'on Redhat' do
    let(:params) {{ :manage_repos => true }}
    with_redhat_facts
    it 'does import repo public key when manage_repos is true' do
      should contain_class('rabbitmq::repo::rhel')
      should contain_exec('rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc')
    end
  end

  context 'on Redhat' do
    let(:params) {{ :manage_repos => false, :repos_ensure => true }}
    with_redhat_facts
    it 'does not import repo public key when manage_repos is false and repos_ensure is true' do
      should_not contain_class('rabbitmq::repo::rhel')
      should_not contain_exec('rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc')
    end
  end

  context 'on Redhat' do
    let(:params) {{ :manage_repos => true, :repos_ensure => true }}
    with_redhat_facts
    it 'does import repo public key when manage_repos is true and repos_ensure is true' do
      should contain_class('rabbitmq::repo::rhel')
      should contain_exec('rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc')
    end
  end

  context 'on Redhat' do
    let(:params) {{ :manage_repos => false, :repos_ensure => false }}
    with_redhat_facts
    it 'does not import repo public key when manage_repos is false and repos_ensure is false' do
      should_not contain_class('rabbitmq::repo::rhel')
      should_not contain_exec('rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc')
    end
  end

  context 'on Redhat' do
    let(:params) {{ :manage_repos => true, :repos_ensure => false }}
    with_redhat_facts
    it 'does not import repo public key when manage_repos is true and repos_ensure is false' do
      should contain_class('rabbitmq::repo::rhel')
      should_not contain_exec('rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc')
    end
  end

  context 'on RedHat 7.0 or more' do
    with_redhat_facts

    it { should contain_file('/etc/systemd/system/rabbitmq-server.service.d').with(
      'ensure'                  => 'directory',
      'owner'                   => '0',
      'group'                   => '0',
      'mode'                    => '0755',
      'selinux_ignore_defaults' => true
    ) }

    it { should contain_exec('rabbitmq-systemd-reload').with(
      'command'     => '/usr/bin/systemctl daemon-reload',
      'notify'      => 'Class[Rabbitmq::Service]',
      'refreshonly' => true
    ) }
    context 'with file_limit => \'unlimited\'' do
      let(:params) {{ :file_limit => 'unlimited' }}
      it { should contain_file('/etc/systemd/system/rabbitmq-server.service.d/limits.conf').with(
        'owner'   => '0',
        'group'   => '0',
        'mode'    => '0644',
        'notify'  => 'Exec[rabbitmq-systemd-reload]',
        'content' => '[Service]
LimitNOFILE=unlimited
'
      ) }
    end

    context 'with file_limit => \'infinity\'' do
      let(:params) {{ :file_limit => 'infinity' }}
      it { should contain_file('/etc/systemd/system/rabbitmq-server.service.d/limits.conf').with(
        'owner'   => '0',
        'group'   => '0',
        'mode'    => '0644',
        'notify'  => 'Exec[rabbitmq-systemd-reload]',
        'content' => '[Service]
LimitNOFILE=infinity
'
      ) }
    end

    context 'with file_limit => \'-1\'' do
      let(:params) {{ :file_limit => '-1' }}
      it { should contain_file('/etc/systemd/system/rabbitmq-server.service.d/limits.conf').with(
        'owner'   => '0',
        'group'   => '0',
        'mode'    => '0644',
        'notify'  => 'Exec[rabbitmq-systemd-reload]',
        'content' => '[Service]
LimitNOFILE=-1
'
      ) }
    end

    context 'with file_limit => \'1234\'' do
      let(:params) {{ :file_limit => '1234' }}
      it { should contain_file('/etc/systemd/system/rabbitmq-server.service.d/limits.conf').with(
        'owner'   => '0',
        'group'   => '0',
        'mode'    => '0644',
        'notify'  => 'Exec[rabbitmq-systemd-reload]',
        'content' => '[Service]
LimitNOFILE=1234
'
      ) }
    end
  end

  ['Debian', 'RedHat', 'SUSE', 'Archlinux'].each do |distro|
    osfacts = {
      :osfamily         => distro,
      :staging_http_get => '',
      :puppetversion    => Puppet.version,
    }

    case distro
    when 'Debian'
      osfacts.merge!({
        :lsbdistcodename => 'squeeze',
        :lsbdistid       => 'Debian'
      })
    when 'RedHat'
      osfacts.merge!({
        :operatingsystemmajrelease => '7',
      })
    end

    context "on #{distro}" do
      let(:facts) { osfacts }

      it { should contain_class('rabbitmq::install') }
      it { should contain_class('rabbitmq::config') }
      it { should contain_class('rabbitmq::service') }

     context 'with admin_enable set to true' do
        let(:params) {{ :admin_enable => true, :node_ip_address => '1.1.1.1' }}
        context 'with service_manage set to true' do
          it 'we enable the admin interface by default' do
            should contain_class('rabbitmq::install::rabbitmqadmin')
            should contain_rabbitmq_plugin('rabbitmq_management').with(
              'require' => 'Class[Rabbitmq::Install]',
              'notify'  => 'Class[Rabbitmq::Service]'
            )
            should contain_staging__file('rabbitmqadmin').with_source("http://guest:guest@1.1.1.1:15672/cli/rabbitmqadmin")
          end
        end
        context 'with default $node_ip_address="UNSET" and service_manage set to true' do
          let(:params) {{ :admin_enable => true, :node_ip_address => 'UNSET' }}
          it 'we enable the admin interface by default' do
            should contain_class('rabbitmq::install::rabbitmqadmin')
            should contain_rabbitmq_plugin('rabbitmq_management').with(
              'require' => 'Class[Rabbitmq::Install]',
              'notify'  => 'Class[Rabbitmq::Service]'
            )
            should contain_staging__file('rabbitmqadmin').with_source("http://guest:guest@127.0.0.1:15672/cli/rabbitmqadmin")
          end
        end
        context 'with service_manage set to true, node_ip_address = "UNSET", and default user/pass specified' do
          let(:params) {{ :admin_enable => true, :default_user => 'foobar', :default_pass => 'hunter2', :node_ip_address => 'UNSET' }}
          it 'we use the correct URL to rabbitmqadmin' do
            should contain_staging__file('rabbitmqadmin').with(
              :source      => 'http://foobar:hunter2@127.0.0.1:15672/cli/rabbitmqadmin',
              :curl_option => '-k  --retry 30 --retry-delay 6',
            )
          end
        end
        context 'with service_manage set to true and default user/pass specified' do
          let(:params) {{ :admin_enable => true, :default_user => 'foobar', :default_pass => 'hunter2', :node_ip_address => '1.1.1.1' }}
          it 'we use the correct URL to rabbitmqadmin' do
            should contain_staging__file('rabbitmqadmin').with(
              :source      => 'http://foobar:hunter2@1.1.1.1:15672/cli/rabbitmqadmin',
              :curl_option => '-k --noproxy 1.1.1.1 --retry 30 --retry-delay 6',
            )
          end
        end
        context 'with service_manage set to true and management port specified' do
          # note that the 2.x management port is 55672 not 15672
          let(:params) {{ :admin_enable => true, :management_port => '55672', :node_ip_address => '1.1.1.1' }}
          it 'we use the correct URL to rabbitmqadmin' do
            should contain_staging__file('rabbitmqadmin').with(
              :source      => 'http://guest:guest@1.1.1.1:55672/cli/rabbitmqadmin',
              :curl_option => '-k --noproxy 1.1.1.1 --retry 30 --retry-delay 6',
            )
          end
        end
        context 'with ipv6, service_manage set to true and management port specified' do
          # note that the 2.x management port is 55672 not 15672
          let(:params) {{ :admin_enable => true, :management_port => '55672', :node_ip_address => '::1' }}
          it 'we use the correct URL to rabbitmqadmin' do
            should contain_staging__file('rabbitmqadmin').with(
              :source      => 'http://guest:guest@[::1]:55672/cli/rabbitmqadmin',
              :curl_option => '-k --noproxy ::1 -g -6 --retry 30 --retry-delay 6',
            )
          end
        end
        context 'with service_manage set to false' do
          let(:params) {{ :admin_enable => true, :service_manage => false }}
          it 'should do nothing' do
            should_not contain_class('rabbitmq::install::rabbitmqadmin')
            should_not contain_rabbitmq_plugin('rabbitmq_management')
          end
        end
      end

      describe 'manages configuration directory correctly' do
        it { should contain_file('/etc/rabbitmq').with(
          'ensure' => 'directory'
        )}
      end

      describe 'manages configuration file correctly' do
        it { should contain_file('rabbitmq.config') }
      end

      context 'configures config_cluster' do
        let(:params) {{
          :config_cluster           => true,
          :cluster_nodes            => ['hare-1', 'hare-2'],
          :cluster_node_type        => 'ram',
          :wipe_db_on_cookie_change => false
        }}

        describe 'with defaults' do
          it 'fails' do
            expect { catalogue }.to raise_error(Puppet::Error, /You must set the \$erlang_cookie value/)
          end
        end

        describe 'with erlang_cookie set' do
          let(:params) {{
            :config_cluster           => true,
            :cluster_nodes            => ['hare-1', 'hare-2'],
            :cluster_node_type        => 'ram',
            :erlang_cookie            => 'TESTCOOKIE',
            :wipe_db_on_cookie_change => true
          }}
          it 'contains the rabbitmq_erlang_cookie' do
            should contain_rabbitmq_erlang_cookie('/var/lib/rabbitmq/.erlang.cookie')
          end
        end

        describe 'with erlang_cookie set but without config_cluster' do
          let(:params) {{
            :config_cluster           => false,
            :erlang_cookie            => 'TESTCOOKIE',
          }}
          it 'contains the rabbitmq_erlang_cookie' do
            should contain_rabbitmq_erlang_cookie('/var/lib/rabbitmq/.erlang.cookie')
          end
        end

        describe 'without erlang_cookie and without config_cluster' do
          let(:params) {{
            :config_cluster           => false,
          }}
          it 'contains the rabbitmq_erlang_cookie' do
            should_not contain_rabbitmq_erlang_cookie('/var/lib/rabbitmq/.erlang.cookie')
          end
        end

        describe 'and sets appropriate configuration' do
          let(:params) {{
            :config_cluster           => true,
            :cluster_nodes            => ['hare-1', 'hare-2'],
            :cluster_node_type        => 'ram',
            :erlang_cookie            => 'ORIGINAL',
            :wipe_db_on_cookie_change => true
          }}
          it 'for cluster_nodes' do
            should contain_file('rabbitmq.config').with({
              'content' => /cluster_nodes.*\['rabbit@hare-1', 'rabbit@hare-2'\], ram/,
            })
          end

        end
      end

      describe 'rabbitmq-env configuration' do
        let(:params) {{ :environment_variables => {
          'NODE_IP_ADDRESS'    => '1.1.1.1',
          'NODE_PORT'          => '5656',
          'NODENAME'           => 'HOSTNAME',
          'SERVICENAME'        => 'RabbitMQ',
          'CONSOLE_LOG'        => 'RabbitMQ.debug',
          'CTL_ERL_ARGS'       => 'verbose',
          'SERVER_ERL_ARGS'    => 'v',
          'SERVER_START_ARGS'  => 'debug'
        }}}
        it 'should set environment variables' do
          should contain_file('rabbitmq-env.config') \
            .with_content(/NODE_IP_ADDRESS=1.1.1.1/) \
            .with_content(/NODE_PORT=5656/) \
            .with_content(/NODENAME=HOSTNAME/) \
            .with_content(/SERVICENAME=RabbitMQ/) \
            .with_content(/CONSOLE_LOG=RabbitMQ.debug/) \
            .with_content(/CTL_ERL_ARGS=verbose/) \
            .with_content(/SERVER_ERL_ARGS=v/) \
            .with_content(/SERVER_START_ARGS=debug/)
        end
      end

      context 'delete_guest_user' do
        describe 'should do nothing by default' do
          it { should_not contain_rabbitmq_user('guest') }
        end

        describe 'delete user when delete_guest_user set' do
          let(:params) {{ :delete_guest_user => true }}
          it 'removes the user' do
            should contain_rabbitmq_user('guest').with(
              'ensure'   => 'absent',
              'provider' => 'rabbitmqctl'
            )
          end
        end
      end

      context 'configuration setting' do
        describe 'node_ip_address when set' do
          let(:params) {{ :node_ip_address => '172.0.0.1' }}
          it 'should set NODE_IP_ADDRESS to specified value' do
            should contain_file('rabbitmq-env.config').
              with_content(%r{NODE_IP_ADDRESS=172\.0\.0\.1})
          end
        end

        describe 'stomp by default' do
          it 'should not specify stomp parameters in rabbitmq.config' do
            should contain_file('rabbitmq.config').without({
              'content' => /stomp/,})
          end
        end
        describe 'stomp when set' do
          let(:params) {{ :config_stomp => true, :stomp_port => 5679 }}
          it 'should specify stomp port in rabbitmq.config' do
            should contain_file('rabbitmq.config').with({
              'content' => /rabbitmq_stomp.*tcp_listeners, \[5679\]/m,
            })
          end
        end
        describe 'stomp when set ssl port w/o ssl enabled' do
          let(:params) {{ :config_stomp => true, :stomp_port => 5679, :ssl => false, :ssl_stomp_port => 5680 }}
          it 'should not configure ssl_listeners in rabbitmq.config' do
            should contain_file('rabbitmq.config').without({
              'content' => /rabbitmq_stomp.*ssl_listeners, \[5680\]/m,
            })
          end
        end
        describe 'stomp when set with ssl' do
          let(:params) {{ :config_stomp => true, :stomp_port => 5679, :ssl => true, :ssl_stomp_port => 5680 }}
          it 'should specify stomp port and ssl stomp port in rabbitmq.config' do
            should contain_file('rabbitmq.config').with({
              'content' => /rabbitmq_stomp.*tcp_listeners, \[5679\].*ssl_listeners, \[5680\]/m,
            })
          end
        end
      end

      describe 'configuring ldap authentication' do
        let :params do
          { :config_stomp          => true,
            :ldap_auth             => true,
            :ldap_server           => 'ldap.example.com',
            :ldap_user_dn_pattern  => 'ou=users,dc=example,dc=com',
            :ldap_other_bind       => 'as_user',
            :ldap_use_ssl          => false,
            :ldap_port             => '389',
            :ldap_log              => true,
            :ldap_config_variables => { 'foo' => 'bar' }
          }
        end

        it { should contain_rabbitmq_plugin('rabbitmq_auth_backend_ldap') }

        it 'should contain ldap parameters' do
          verify_contents(catalogue, 'rabbitmq.config',
                          ['[', '  {rabbit, [', '    {auth_backends, [rabbit_auth_backend_internal, rabbit_auth_backend_ldap]},', '  ]}',
                            '  {rabbitmq_auth_backend_ldap, [', '    {other_bind, as_user},',
                            '    {servers, ["ldap.example.com"]},',
                            '    {user_dn_pattern, "ou=users,dc=example,dc=com"},', '    {use_ssl, false},',
                            '    {port, 389},', '    {foo, bar},', '    {log, true}'])
        end
      end

      describe 'configuring ldap authentication' do
        let :params do
          { :config_stomp         => false,
            :ldap_auth            => true,
            :ldap_server          => 'ldap.example.com',
            :ldap_user_dn_pattern => 'ou=users,dc=example,dc=com',
            :ldap_other_bind      => 'as_user',
            :ldap_use_ssl         => false,
            :ldap_port            => '389',
            :ldap_log             => true,
            :ldap_config_variables => { 'foo' => 'bar' }
          }
        end

        it { should contain_rabbitmq_plugin('rabbitmq_auth_backend_ldap') }

        it 'should contain ldap parameters' do
          verify_contents(catalogue, 'rabbitmq.config',
                          ['[', '  {rabbit, [', '    {auth_backends, [rabbit_auth_backend_internal, rabbit_auth_backend_ldap]},', '  ]}',
                            '  {rabbitmq_auth_backend_ldap, [', '    {other_bind, as_user},',
                            '    {servers, ["ldap.example.com"]},',
                            '    {user_dn_pattern, "ou=users,dc=example,dc=com"},', '    {use_ssl, false},',
                            '    {port, 389},', '    {foo, bar},', '    {log, true}'])
        end
      end

      describe 'configuring auth_backends' do
        let :params do
          { :auth_backends   => ['{baz, foo}', 'bar'] }
        end
        it 'should contain auth_backends' do
          verify_contents(catalogue, 'rabbitmq.config',
                          ['    {auth_backends, [{baz, foo}, bar]},'])
        end
      end

      describe 'auth_backends overrides ldap_auth' do
        let :params do
          { :auth_backends   => ['{baz, foo}', 'bar'],
            :ldap_auth => true, }
        end
        it 'should contain auth_backends' do
          verify_contents(catalogue, 'rabbitmq.config',
                          ['    {auth_backends, [{baz, foo}, bar]},'])
        end
      end

      describe 'configuring shovel plugin' do
        let :params do
          {
            :config_shovel => true
          }
        end

        it { should contain_rabbitmq_plugin('rabbitmq_shovel') }

        it { should contain_rabbitmq_plugin('rabbitmq_shovel_management') }

        describe 'with admin_enable false' do
          let :params do
            {
              :config_shovel => true,
              :admin_enable  => false
            }
          end

          it { should_not contain_rabbitmq_plugin('rabbitmq_shovel_management') }
        end

        describe 'with static shovels' do
          let :params do
            {
              :config_shovel => true,
              :config_shovel_statics => {
                'shovel_first' => %q({sources,[{broker,"amqp://"}]},
        {destinations,[{broker,"amqp://site1.example.com"}]},
        {queue,<<"source_one">>}),
                'shovel_second' => %q({sources,[{broker,"amqp://"}]},
        {destinations,[{broker,"amqp://site2.example.com"}]},
        {queue,<<"source_two">>})
              }
            }
          end

          it "should generate correct configuration" do
            verify_contents(catalogue, 'rabbitmq.config', [
'  {rabbitmq_shovel,',
'    [{shovels,[',
'      {shovel_first,[{sources,[{broker,"amqp://"}]},',
'        {destinations,[{broker,"amqp://site1.example.com"}]},',
'        {queue,<<"source_one">>}]},',
'      {shovel_second,[{sources,[{broker,"amqp://"}]},',
'        {destinations,[{broker,"amqp://site2.example.com"}]},',
'        {queue,<<"source_two">>}]}',
'    ]}]}' ])
          end
        end
      end

      describe 'configuring shovel plugin' do
        let :params do
          {
            :config_shovel => true
          }
        end

        it { should contain_rabbitmq_plugin('rabbitmq_shovel') }

        it { should contain_rabbitmq_plugin('rabbitmq_shovel_management') }

        describe 'with admin_enable false' do
          let :params do
            {
              :config_shovel => true,
              :admin_enable  => false
            }
          end

          it { should_not contain_rabbitmq_plugin('rabbitmq_shovel_management') }
        end

        describe 'with static shovels' do
          let :params do
            {
              :config_shovel => true,
              :config_shovel_statics => {
                'shovel_first' => %q({sources,[{broker,"amqp://"}]},
        {destinations,[{broker,"amqp://site1.example.com"}]},
        {queue,<<"source_one">>}),
                'shovel_second' => %q({sources,[{broker,"amqp://"}]},
        {destinations,[{broker,"amqp://site2.example.com"}]},
        {queue,<<"source_two">>})
              }
            }
          end

          it "should generate correct configuration" do
            verify_contents(catalogue, 'rabbitmq.config', [
'  {rabbitmq_shovel,',
'    [{shovels,[',
'      {shovel_first,[{sources,[{broker,"amqp://"}]},',
'        {destinations,[{broker,"amqp://site1.example.com"}]},',
'        {queue,<<"source_one">>}]},',
'      {shovel_second,[{sources,[{broker,"amqp://"}]},',
'        {destinations,[{broker,"amqp://site2.example.com"}]},',
'        {queue,<<"source_two">>}]}',
'    ]}]}' ])
          end
        end
      end

      describe 'default_user and default_pass set' do
        let(:params) {{ :default_user => 'foo', :default_pass => 'bar' }}
        it 'should set default_user and default_pass to specified values' do
          should contain_file('rabbitmq.config').with({
            'content' => /default_user, <<"foo">>.*default_pass, <<"bar">>/m,
          })
        end
      end

      describe 'interfaces option with no ssl' do
        let(:params) {
          { :interface => '0.0.0.0',
        } }

        it 'should set ssl options to specified values' do
          should contain_file('rabbitmq.config').with_content(%r{tcp_listeners, \[\{"0.0.0.0", 5672\}\]})
        end
      end

      describe 'ssl options and mangament_ssl false' do
        let(:params) {
          { :ssl => true,
            :ssl_port => 3141,
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key',
            :management_ssl => false,
            :management_port => 13142
        } }

        it 'should set ssl options to specified values' do
          should contain_file('rabbitmq.config').with_content(
            %r{ssl_listeners, \[3141\]}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{ssl_options, \[}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{cacertfile,"/path/to/cacert"}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{certfile,"/path/to/cert"}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{keyfile,"/path/to/key"}
          )
        end
        it 'should set non ssl port for management port' do
          should contain_file('rabbitmq.config').with_content(
            %r{port, 13142}
          )
        end
      end

        describe 'ssl options and mangament_ssl true' do
        let(:params) {
          { :ssl => true,
            :ssl_port => 3141,
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key',
            :management_ssl => true,
            :ssl_management_port => 13141
        } }

        it 'should set ssl options to specified values' do
          should contain_file('rabbitmq.config').with_content(
            %r{ssl_listeners, \[3141\]}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{ssl_opts, }
          )
          should contain_file('rabbitmq.config').with_content(
            %r{ssl_options, \[}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{cacertfile,"/path/to/cacert"}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{certfile,"/path/to/cert"}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{keyfile,"/path/to/key"}
          )
        end
        it 'should set ssl managment port to specified values' do
          should contain_file('rabbitmq.config').with_content(
            %r{port, 13141}
          )
        end
      end

      describe 'ssl options' do
        let(:params) {
          { :ssl => true,
            :ssl_port => 3141,
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key'
        } }

        it 'should set ssl options to specified values' do
          should contain_file('rabbitmq.config').with_content(
            %r{ssl_listeners, \[3141\]}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{ssl_options, \[}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{cacertfile,"/path/to/cacert"}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{certfile,"/path/to/cert"}
          )
          should contain_file('rabbitmq.config').with_content(
            %r{keyfile,"/path/to/key"}
          )
        end
      end


      describe 'ssl options with ssl_interfaces' do
        let(:params) {
          { :ssl => true,
            :ssl_port => 3141,
            :ssl_interface => '0.0.0.0',
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key'
        } }

        it 'should set ssl options to specified values' do
          should contain_file('rabbitmq.config').with_content(%r{ssl_listeners, \[\{"0.0.0.0", 3141\}\]})
          should contain_file('rabbitmq.config').with_content(%r{cacertfile,"/path/to/cacert"})
          should contain_file('rabbitmq.config').with_content(%r{certfile,"/path/to/cert"})
          should contain_file('rabbitmq.config').with_content(%r{keyfile,"/path/to/key})
        end
      end



      describe 'ssl options with ssl_only' do
        let(:params) {
          { :ssl => true,
            :ssl_only => true,
            :ssl_port => 3141,
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key'
        } }

        it 'should set ssl options to specified values' do
          should contain_file('rabbitmq.config').with_content(%r{tcp_listeners, \[\]})
          should contain_file('rabbitmq.config').with_content(%r{ssl_listeners, \[3141\]})
          should contain_file('rabbitmq.config').with_content(%r{ssl_options, \[})
          should contain_file('rabbitmq.config').with_content(%r{cacertfile,"/path/to/cacert"})
          should contain_file('rabbitmq.config').with_content(%r{certfile,"/path/to/cert"})
          should contain_file('rabbitmq.config').with_content(%r{keyfile,"/path/to/key})
        end
      end

      describe 'ssl options with ssl_only and ssl_interfaces' do
        let(:params) {
          { :ssl => true,
            :ssl_only => true,
            :ssl_port => 3141,
            :ssl_interface => '0.0.0.0',
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key'
        } }

        it 'should set ssl options to specified values' do
          should contain_file('rabbitmq.config').with_content(%r{tcp_listeners, \[\]})
          should contain_file('rabbitmq.config').with_content(%r{ssl_listeners, \[\{"0.0.0.0", 3141\}\]})
          should contain_file('rabbitmq.config').with_content(%r{cacertfile,"/path/to/cacert"})
          should contain_file('rabbitmq.config').with_content(%r{certfile,"/path/to/cert"})
          should contain_file('rabbitmq.config').with_content(%r{keyfile,"/path/to/key})
        end
      end

      describe 'ssl options with specific ssl versions' do
        let(:params) {
          { :ssl => true,
            :ssl_port => 3141,
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key',
            :ssl_versions => ['tlsv1.2', 'tlsv1.1']
        } }

        it 'should set ssl options to specified values' do
          should contain_file('rabbitmq.config').with_content(%r{ssl_listeners, \[3141\]})
          should contain_file('rabbitmq.config').with_content(%r{ssl_options, \[})
          should contain_file('rabbitmq.config').with_content(%r{cacertfile,"/path/to/cacert"})
          should contain_file('rabbitmq.config').with_content(%r{certfile,"/path/to/cert"})
          should contain_file('rabbitmq.config').with_content(%r{keyfile,"/path/to/key})
          should contain_file('rabbitmq.config').with_content(%r{ssl, \[\{versions, \['tlsv1.1', 'tlsv1.2'\]\}\]})
          should contain_file('rabbitmq.config').with_content(%r{versions, \['tlsv1.1', 'tlsv1.2'\]})
        end
      end

      describe 'ssl options with invalid ssl_versions type' do
        let(:params) {
          { :ssl => true,
            :ssl_port => 3141,
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key',
            :ssl_versions => 'tlsv1.2, tlsv1.1'
        } }

        it 'fails' do
          expect { catalogue }.to raise_error(Puppet::Error, /is not an Array/)
        end
      end

      describe 'ssl options with ssl_versions and not ssl' do
        let(:params) {
          { :ssl => false,
            :ssl_port => 3141,
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key',
            :ssl_versions => ['tlsv1.2', 'tlsv1.1']
        } }

        it 'fails' do
          expect { catalogue }.to raise_error(Puppet::Error, /\$ssl_versions requires that \$ssl => true/)
        end
      end

      describe 'ssl options with ssl ciphers' do
        let(:params) {
          { :ssl => true,
            :ssl_port => 3141,
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key',
            :ssl_ciphers => ['ecdhe_rsa,aes_256_cbc,sha', 'dhe_rsa,aes_256_cbc,sha']
        } }

        it 'should set ssl ciphers to specified values' do
          should contain_file('rabbitmq.config').with_content(%r{ciphers,\[[[:space:]]+{dhe_rsa,aes_256_cbc,sha},[[:space:]]+{ecdhe_rsa,aes_256_cbc,sha}[[:space:]]+\]})
        end
      end

      describe 'ssl admin options with specific ssl versions' do
        let(:params) {
          { :ssl => true,
            :ssl_management_port => 5926,
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key',
            :ssl_versions => ['tlsv1.2', 'tlsv1.1'],
            :admin_enable => true
        } }

        it 'should set admin ssl opts to specified values' do
          should contain_file('rabbitmq.config').with_content(%r{rabbitmq_management, \[})
          should contain_file('rabbitmq.config').with_content(%r{listener, \[})
          should contain_file('rabbitmq.config').with_content(%r{port, 5926\}})
          should contain_file('rabbitmq.config').with_content(%r{ssl, true\}})
          should contain_file('rabbitmq.config').with_content(%r{ssl_opts, \[})
          should contain_file('rabbitmq.config').with_content(%r{cacertfile, "/path/to/cacert"\},})
          should contain_file('rabbitmq.config').with_content(%r{certfile, "/path/to/cert"\},})
          should contain_file('rabbitmq.config').with_content(%r{keyfile, "/path/to/key"\}})
          should contain_file('rabbitmq.config').with_content(%r{,\{versions, \['tlsv1.1', 'tlsv1.2'\]\}})
        end
      end

      describe 'ssl admin options' do
        let(:params) {
          { :ssl => true,
            :ssl_management_port => 3141,
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key',
            :admin_enable => true
        } }

        it 'should set rabbitmq_management ssl options to specified values' do
          should contain_file('rabbitmq.config').with_content(%r{rabbitmq_management, \[})
          should contain_file('rabbitmq.config').with_content(%r{listener, \[})
          should contain_file('rabbitmq.config').with_content(%r{port, 3141\}})
          should contain_file('rabbitmq.config').with_content(%r{ssl, true\}})
          should contain_file('rabbitmq.config').with_content(%r{ssl_opts, \[})
          should contain_file('rabbitmq.config').with_content(%r{cacertfile, "/path/to/cacert"\},})
          should contain_file('rabbitmq.config').with_content(%r{certfile, "/path/to/cert"\},})
          should contain_file('rabbitmq.config').with_content(%r{keyfile, "/path/to/key"\}})
        end
      end

      describe 'admin without ssl' do
        let(:params) {
          { :ssl => false,
            :management_port => 3141,
            :admin_enable => true
        } }

        it 'should set rabbitmq_management  options to specified values' do
          should contain_file('rabbitmq.config').with_content(%r{rabbitmq_management, \[})
          should contain_file('rabbitmq.config').with_content(%r{listener, \[})
          should contain_file('rabbitmq.config').with_content(%r{port, 3141\}})
        end
      end

      describe 'ssl admin options' do
        let(:params) {
          { :ssl => true,
            :ssl_management_port => 3141,
            :ssl_cacert => '/path/to/cacert',
            :ssl_cert => '/path/to/cert',
            :ssl_key => '/path/to/key',
            :admin_enable => true
        } }

        it 'should set rabbitmq_management ssl options to specified values' do
          should contain_file('rabbitmq.config').with_content(%r{rabbitmq_management, \[})
          should contain_file('rabbitmq.config').with_content(%r{listener, \[})
          should contain_file('rabbitmq.config').with_content(%r{port, 3141\},})
          should contain_file('rabbitmq.config').with_content(%r{ssl, true\},})
          should contain_file('rabbitmq.config').with_content(%r{ssl_opts, \[})
          should contain_file('rabbitmq.config').with_content(%r{cacertfile, "/path/to/cacert"\},})
          should contain_file('rabbitmq.config').with_content(%r{certfile, "/path/to/cert"\},})
          should contain_file('rabbitmq.config').with_content(%r{keyfile, "/path/to/key"\}})
        end
      end

      describe 'admin without ssl' do
        let(:params) {
          { :ssl => false,
            :management_port => 3141,
            :admin_enable => true
        } }

        it 'should set rabbitmq_management  options to specified values' do
          should contain_file('rabbitmq.config') \
            .with_content(/\{rabbitmq_management, \[/) \
            .with_content(/\{listener, \[/) \
            .with_content(/\{port, 3141\}/)
        end
      end

      describe 'config_variables options' do
        let(:params) {{ :config_variables => {
            'hipe_compile'                  => true,
            'vm_memory_high_watermark'      => 0.4,
            'frame_max'                     => 131072,
            'collect_statistics'            => "none",
            'auth_mechanisms'               => "['PLAIN', 'AMQPLAIN']",
        }}}
        it 'should set environment variables' do
          should contain_file('rabbitmq.config') \
            .with_content(/\{hipe_compile, true\}/) \
            .with_content(/\{vm_memory_high_watermark, 0.4\}/) \
            .with_content(/\{frame_max, 131072\}/) \
            .with_content(/\{collect_statistics, none\}/) \
            .with_content(/\{auth_mechanisms, \['PLAIN', 'AMQPLAIN'\]\}/)
        end
      end

      describe 'config_kernel_variables options' do
        let(:params) {{ :config_kernel_variables => {
            'inet_dist_listen_min'      => 9100,
            'inet_dist_listen_max'      => 9105,
        }}}
        it 'should set config variables' do
          should contain_file('rabbitmq.config') \
            .with_content(/\{inet_dist_listen_min, 9100\}/) \
            .with_content(/\{inet_dist_listen_max, 9105\}/)
        end
      end

      describe 'config_management_variables' do
        let(:params) {{ :config_management_variables => {
            'rates_mode'      => 'none',
        }}}
        it 'should set config variables' do
          should contain_file('rabbitmq.config') \
            .with_content(/\{rates_mode, none\}/)
        end
      end

      describe 'tcp_keepalive enabled' do
        let(:params) {{ :tcp_keepalive => true }}
        it 'should set tcp_listen_options keepalive true' do
          should contain_file('rabbitmq.config') \
            .with_content(/\{keepalive,     true\}/)
        end
      end

      describe 'tcp_keepalive disabled (default)' do
        it 'should not set tcp_listen_options' do
          should contain_file('rabbitmq.config') \
            .without_content(/\{keepalive,     true\}/)
        end
      end

      describe 'non-bool tcp_keepalive parameter' do
        let :params do
          { :tcp_keepalive => 'string' }
        end

        it 'should raise an error' do
          expect {
            should contain_file('rabbitmq.config')
          }.to raise_error(Puppet::Error, /is not a boolean/)
        end
      end

      describe 'tcp_backlog with default value' do
        it 'should set tcp_listen_options backlog to 128' do
          should contain_file('rabbitmq.config') \
            .with_content(/\{backlog,       128\}/)
        end
      end

      describe 'tcp_backlog with non-default value' do
        let(:params) do
          { :tcp_backlog => 256 }
        end

        it 'should set tcp_listen_options backlog to 256' do
          should contain_file('rabbitmq.config') \
            .with_content(/\{backlog,       256\}/)
        end
      end

      describe 'tcp_sndbuf with default value' do
        it 'should not set tcp_listen_options sndbuf' do
          should contain_file('rabbitmq.config') \
            .without_content(/sndbuf/)
        end
      end

      describe 'tcp_sndbuf with non-default value' do
        let(:params) do
          { :tcp_sndbuf => 128 }
        end

        it 'should set tcp_listen_options sndbuf to 128' do
          should contain_file('rabbitmq.config') \
            .with_content(/\{sndbuf,       128\}/)
        end
      end

      describe 'tcp_recbuf with default value' do
        it 'should not set tcp_listen_options recbuf' do
          should contain_file('rabbitmq.config') \
            .without_content(/recbuf/)
        end
      end

      describe 'tcp_recbuf with non-default value' do
        let(:params) do
          { :tcp_recbuf => 128 }
        end

        it 'should set tcp_listen_options recbuf to 128' do
          should contain_file('rabbitmq.config') \
            .with_content(/\{recbuf,       128\}/)
        end
      end

      describe 'rabbitmq-heartbeat options' do
        let(:params) {{ :heartbeat => 60 }}
        it 'should set heartbeat paramter in config file' do
          should contain_file('rabbitmq.config') \
            .with_content(/\{heartbeat, 60\}/)
        end
      end

      describe 'non-integer rabbitmq-heartbeat options' do
        let(:params) {{ :heartbeat => 'string' }}
        it 'should raise a validation error' do
          expect {
            should contain_file('rabbitmq.config')
          }.to raise_error(Puppet::Error, /Expected first argument to be an Integer/)
        end
      end

      context 'delete_guest_user' do
        describe 'should do nothing by default' do
          it { should_not contain_rabbitmq_user('guest') }
        end

        describe 'delete user when delete_guest_user set' do
          let(:params) {{ :delete_guest_user => true }}
          it 'removes the user' do
            should contain_rabbitmq_user('guest').with(
              'ensure'   => 'absent',
              'provider' => 'rabbitmqctl'
            )
          end
        end
      end

      ##
      ## rabbitmq::service
      ##
      describe 'service with default params' do
        it { should contain_service('rabbitmq-server').with(
          'ensure'     => 'running',
          'enable'     => 'true',
          'hasstatus'  => 'true',
          'hasrestart' => 'true'
        )}
      end

      describe 'service with ensure stopped' do
        let :params do
          { :service_ensure => 'stopped' }
        end

        it { should contain_service('rabbitmq-server').with(
          'ensure'    => 'stopped',
          'enable'    => false
        ) }
      end

      describe 'service with ensure neither running neither stopped' do
        let :params do
          { :service_ensure => 'foo' }
        end

        it 'should raise an error' do
          expect {
            should contain_service('rabbitmq-server').with(
              'ensure' => 'stopped' )
          }.to raise_error(Puppet::Error, /validate_re\(\): "foo" does not match "\^\(running\|stopped\)\$"/)
        end
      end

      describe 'service with service_manage equal to false' do
        let :params do
          { :service_manage => false }
        end

        it { should_not contain_service('rabbitmq-server') }
      end

    end
  end

  ##
  ## rabbitmq::install
  ##
  context "on RHEL" do
    with_redhat_facts
    let(:params) {{ :package_source => 'http://www.rabbitmq.com/releases/rabbitmq-server/v3.2.3/rabbitmq-server-3.2.3-1.noarch.rpm' }}
    it 'installs the rabbitmq package' do
      should contain_package('rabbitmq-server').with(
        'ensure'   => 'installed',
        'name'     => 'rabbitmq-server',
        'provider' => 'yum',
        'source'   => 'http://www.rabbitmq.com/releases/rabbitmq-server/v3.2.3/rabbitmq-server-3.2.3-1.noarch.rpm'
      )
    end
  end

  context "on Debian" do
    with_debian_facts
    it 'installs the rabbitmq package' do
      should contain_package('rabbitmq-server').with(
        'ensure'   => 'installed',
        'name'     => 'rabbitmq-server',
        'provider' => 'apt'
      )
    end
  end

  context "on Archlinux" do
    let(:facts) {{ :osfamily => 'Archlinux', :staging_http_get => ''}}
    it 'installs the rabbitmq package' do
      should contain_package('rabbitmq-server').with(
        'ensure'   => 'installed',
        'name'     => 'rabbitmq')
    end
  end

  context "on OpenBSD" do
    with_openbsd_facts
    it 'installs the rabbitmq package' do
      should contain_package('rabbitmq-server').with(
        'ensure'   => 'installed',
        'name'     => 'rabbitmq',
        'provider' => 'openbsd'
      )
    end
  end

  describe 'repo management on Debian' do
    with_debian_facts

    context 'with no pin' do
      let(:params) {{ :package_apt_pin => '' }}
      describe 'it sets up an apt::source' do

        it { should contain_apt__source('rabbitmq').with(
          'location'    => 'http://www.rabbitmq.com/debian/',
          'release'     => 'testing',
          'repos'       => 'main',
          'include_src' => false,
          'key'         => '0A9AF2115F4687BD29803A206B73A36E6026DFCA'
        ) }
      end
    end

    context 'with pin' do
      let(:params) {{ :package_apt_pin => '700' }}
      describe 'it sets up an apt::source and pin' do

        it { should contain_apt__source('rabbitmq').with(
          'location'    => 'http://www.rabbitmq.com/debian/',
          'release'     => 'testing',
          'repos'       => 'main',
          'include_src' => false,
          'key'         => '0A9AF2115F4687BD29803A206B73A36E6026DFCA'
        ) }

        it { should contain_apt__pin('rabbitmq').with(
          'packages' => '*',
          'priority' => '700',
          'origin'   => 'www.rabbitmq.com'
        ) }

      end
    end
  end

  ['RedHat', 'SuSE'].each do |distro|
    osfacts = {
      :osfamily         => distro,
      :staging_http_get => ''
    }

    case distro
    when 'Debian'
      osfacts.merge!({
        :lsbdistcodename => 'squeeze',
        :lsbdistid => 'Debian'
      })
    when 'RedHat'
      osfacts.merge!({
        :operatingsystemmajrelease => '7',
      })
    end

    describe "repo management on #{distro}" do
      describe 'imports the key' do
        let(:facts) { osfacts }
        let(:params) {{ :package_gpg_key => 'https://www.rabbitmq.com/rabbitmq-release-signing-key.asc' }}

        it { should contain_exec("rpm --import #{params[:package_gpg_key]}").with(
          'path' => ['/bin','/usr/bin','/sbin','/usr/sbin']
        ) }
      end
    end
  end

end
