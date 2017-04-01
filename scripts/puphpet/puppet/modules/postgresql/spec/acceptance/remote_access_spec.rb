require 'spec_helper_acceptance'

describe 'remote-access', :unless => UNSUPPORTED_PLATFORMS.include?(fact('osfamily')) do
  before do
    skip "These tests require the spec/acceptance/nodesets/centos-64-x64-2-hosts nodeset"
  end

  describe "configuring multi-node postgresql" do

    # Get the database's IP to connect to from the database
    let(:database_ip_address) do
      hosts_as('database').inject({}) do |memo,host|
        fact_on host, "ipaddress_eth1"
      end
    end

    hosts_as('database').each do |host|
      it "should be able to configure a host as database on #{host}" do
        pp = <<-EOS
        # Stop firewall so we can easily connect
        service {'iptables':
          ensure => 'stopped',
        }

        class { 'postgresql::server':
          ip_mask_allow_all_users => '0.0.0.0/0',
          listen_addresses        => '*',
        }

        postgresql::server::db { 'puppet':
          user     => 'puppet',
          password => postgresql_password('puppet', 'puppet'),
        }

        postgresql::server::pg_hba_rule { 'allow full yolo access password':
          type        => 'host',
          database    => 'all',
          user        => 'all',
          address     => '0.0.0.0/0',
          auth_method => 'password',
          order       => '002',
        }
        EOS
        apply_manifest_on(host, pp, :catch_failures => true)
      end
    end

    hosts_as('client').each do |host|
      it "should be able to configure a host as client on #{host} and then access database" do
        pp = <<-EOS
        class { 'postgresql::client':}

        $connection_settings = {
                                     'PGUSER'     => "puppet",
                                     'PGPASSWORD' => "puppet",
                                     'PGHOST'     => "#{database_ip_address}",
                                     'PGPORT'     => "5432",
                                     'PGDATABASE' => "puppet",
                                  }

        postgresql_psql { 'run using connection_settings':
          command             => 'select 1',
          psql_user           => 'root',
          psql_group          => 'root',
          connect_settings    => $connection_settings,
        }
        EOS
        apply_manifest_on(host, pp, :catch_failures => true)
      end
    end
  end
end
