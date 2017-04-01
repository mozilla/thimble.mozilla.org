require 'spec_helper_acceptance'
require 'spec_helper_faraday'
require 'json'

describe "elasticsearch shield" do

  # Template manifest
  let :base_manifest do <<-EOF
    class { 'elasticsearch' :
      java_install => true,
      manage_repo  => true,
      repo_version => '#{test_settings['repo_version']}',
      config => {
        'cluster.name' => '#{test_settings['cluster_name']}',
        'http.port' => #{test_settings['port_a']},
      },
      restart_on_change => true,
    }

    elasticsearch::plugin { 'elasticsearch/license/latest' :  }
    elasticsearch::plugin { 'elasticsearch/shield/latest' : }
    EOF
  end

  describe 'user authentication' do

    describe 'single instance manifest' do

      let :single_manifest do
        base_manifest + <<-EOF
          elasticsearch::instance { ['es-01'] :  }

          Elasticsearch::Plugin { instances => ['es-01'],  }

          elasticsearch::shield::user { '#{test_settings['shield_user']}':
            password => '#{test_settings['shield_password']}',
            roles    => ['admin'],
          }
          elasticsearch::shield::user { '#{test_settings['shield_user']}pwchange':
            password => '#{test_settings['shield_hashed_password']}',
            roles    => ['admin'],
          }
        EOF
      end

      it 'should apply cleanly' do
        apply_manifest single_manifest, :catch_failures => true
      end

      it 'should be idempotent' do
        apply_manifest(
          single_manifest,
          :catch_changes => true
        )
      end
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}/_cluster/health",
        :faraday_middleware => middleware
      ) do
        it 'denies unauthorized access', :with_retries do
          expect(response.status).to eq(401)
        end
      end

      describe http(
        "http://localhost:#{test_settings['port_a']}/_cluster/health",
        {
          :faraday_middleware => middleware,
          :basic_auth => [
            test_settings['shield_user'],
            test_settings['shield_password']
          ]
        }
      ) do
        it 'permits authorized access', :with_retries do
          expect(response.status).to eq(200)
        end
      end

      describe http(
        "http://localhost:#{test_settings['port_a']}/_cluster/health",
        {
          :faraday_middleware => middleware,
          :basic_auth => [
            "#{test_settings['shield_user']}pwchange",
            test_settings['shield_hashed_plaintext']
          ]
        }
      ) do
        it 'permits authorized access using pre-hashed creds',
           :with_retries do
          expect(response.status).to eq(200)
        end
      end
    end
  end

  describe 'changing passwords' do
    describe 'password change manifest' do

      let :passwd_manifest do
        base_manifest + <<-EOF
          elasticsearch::instance { ['es-01'] :  }

          Elasticsearch::Plugin { instances => ['es-01'],  }

          notify { 'change password' : } ~>
          elasticsearch::shield::user { '#{test_settings['shield_user']}pwchange':
            password => '#{test_settings['shield_password'][0..5]}',
            roles    => ['admin'],
          }
        EOF
      end

      it 'should apply cleanly' do
        apply_manifest passwd_manifest, :catch_failures => true
      end
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}/_cluster/health",
        {
          :faraday_middleware => middleware,
          :basic_auth => [
            "#{test_settings['shield_user']}pwchange",
            test_settings['shield_password'][0..5]
          ]
        }
      ) do
        it 'authorizes changed passwords', :with_retries do
          expect(response.status).to eq(200)
        end
      end
    end
  end

  describe 'role permission control' do

    describe 'single instance manifest' do

      let :single_manifest do
        base_manifest + <<-EOF
          elasticsearch::instance { ['es-01'] :  }

          Elasticsearch::Plugin { instances => ['es-01'],  }


          elasticsearch::shield::role { '#{@role}':
            privileges => {
              'cluster' => [
                'cluster:monitor/health',
              ]
            }
          }

          elasticsearch::shield::user { '#{test_settings['shield_user']}':
            password => '#{test_settings['shield_password']}',
            roles    => ['#{@role}'],
          }
        EOF
      end

      it 'should apply cleanly' do
        apply_manifest single_manifest, :catch_failures => true
      end

      it 'should be idempotent' do
        apply_manifest(
          single_manifest,
          :catch_changes => true
        )
      end
    end

    describe port(test_settings['port_a']) do
      it 'open', :with_retries do should be_listening end
    end

    describe server :container do
      describe http(
        "http://localhost:#{test_settings['port_a']}/_cluster/stats",
        {
          :faraday_middleware => middleware,
          :basic_auth => [
            test_settings['shield_user'],
            test_settings['shield_password']
          ]
        }
      ) do
        it 'denies stats API access', :with_retries do
          expect(response.status).to eq(403)
        end
      end

      describe http(
        "http://localhost:#{test_settings['port_a']}/_cluster/health",
        {
          :faraday_middleware => middleware,
          :basic_auth => [
            test_settings['shield_user'],
            test_settings['shield_password']
          ]
        }
      ) do
        it 'permits health API access', :with_retries do
          expect(response.status).to eq(200)
        end
      end
    end
  end

  describe 'tls' do

    describe 'single instance' do

      describe 'manifest' do

        let :single_manifest do
          base_manifest + <<-EOF
            elasticsearch::instance { 'es-01':
              ssl                  => true,
              ca_certificate       => '#{@tls[:ca][:cert][:path]}',
              certificate          => '#{@tls[:clients].first[:cert][:path]}',
              private_key          => '#{@tls[:clients].first[:key][:path]}',
              keystore_password    => '#{@keystore_password}',
            }

            Elasticsearch::Plugin { instances => ['es-01'],  }

            elasticsearch::shield::user { '#{test_settings['shield_user']}':
              password => '#{test_settings['shield_password']}',
              roles => ['admin'],
            }
          EOF
        end

        it 'should apply cleanly' do
          apply_manifest single_manifest, :catch_failures => true
        end

        it 'should be idempotent' do
          apply_manifest(
            single_manifest,
            :catch_changes => true
          )
        end
      end

      describe port(test_settings['port_a']) do
        it 'open', :with_retries do should be_listening end
      end

      describe server :container do
        describe http(
          "https://localhost:#{test_settings['port_a']}/_cluster/health",
          {
            :faraday_middleware => middleware,
            :basic_auth => [
              test_settings['shield_user'],
              test_settings['shield_password']
            ],
            :ssl => {:verify => false}
          }
        ) do
          it 'permits TLS health API access', :with_retries do
            expect(response.status).to eq(200)
          end
        end
      end
    end

    describe 'multi-instance' do

      describe 'manifest' do

        let :multi_manifest do
          base_manifest + %Q{
            elasticsearch::shield::user { '#{test_settings['shield_user']}':
              password => '#{test_settings['shield_password']}',
              roles => ['admin'],
            }
          } + @tls[:clients].each_with_index.map do |cert, i|
            %Q{
              elasticsearch::instance { 'es-%02d':
                ssl                  => true,
                ca_certificate       => '#{@tls[:ca][:cert][:path]}',
                certificate          => '#{cert[:cert][:path]}',
                private_key          => '#{cert[:key][:path]}',
                keystore_password    => '#{@keystore_password}',
                config => {
                  'discovery.zen.minimum_master_nodes' => %s,
                  'shield.ssl.hostname_verification' => false,
                  'http.port' => '92%02d',
                }
              }
            } % [i+1, @tls[:clients].length, i]
          end.join("\n") + %Q{
            Elasticsearch::Plugin { instances => %s, }
          } % @tls[:clients].each_with_index.map { |_, i| "es-%02d" % (i+1)}.to_s
        end

        it 'should apply cleanly' do
          apply_manifest multi_manifest, :catch_failures => true
        end

        it 'should be idempotent' do
          apply_manifest(
            multi_manifest,
            :catch_changes => true
          )
        end
      end

      describe port(test_settings['port_a']) do
        it 'open', :with_retries do should be_listening end
      end

      describe port(test_settings['port_b']) do
        it 'open', :with_retries do should be_listening end
      end

      describe server :container do
        describe http(
          "https://localhost:#{test_settings['port_a']}/_nodes",
          {
            :faraday_middleware => middleware,
            :basic_auth => [
              test_settings['shield_user'],
              test_settings['shield_password']
            ],
            :ssl => {:verify => false}
          }
        ) do
          it 'clusters over TLS', :with_generous_retries do
            expect(
              JSON.parse(response.body)['nodes'].size
            ).to eq(2)
          end
        end
      end
    end
  end

  describe 'module removal' do

    describe 'manifest' do

      let :removal_manifest do
        %Q{
          class { 'elasticsearch' : ensure => absent, }

          Elasticsearch::Instance { ensure => absent, }
          elasticsearch::instance { %s : }
        } % @tls[:clients].each_with_index.map do |_, i|
          "es-%02d" % (i+1)
        end.to_s
      end

      it 'should apply cleanly' do
        apply_manifest removal_manifest, :catch_failures => true
      end
    end
  end

  # Boilerplate for shield setup
  before :all do

    @keystore_password = SecureRandom.hex
    @role = [*('a'..'z')].sample(8).join

    # Setup TLS cert placement
    @tls = gen_certs(2, '/tmp')

    create_remote_file hosts, @tls[:ca][:cert][:path], @tls[:ca][:cert][:pem]
    @tls[:clients].each do |node|
      node.each do |type, params|
        create_remote_file hosts, params[:path], params[:pem]
      end
    end
  end
end
