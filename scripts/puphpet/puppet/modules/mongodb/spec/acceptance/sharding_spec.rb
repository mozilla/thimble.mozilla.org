require 'spec_helper_acceptance'

if hosts.length > 1
  describe 'mongodb_shard resource' do

    it 'configures the shard server' do
      pp = <<-EOS
        class { 'mongodb::globals': }
        -> class { 'mongodb::server':
          bind_ip   => '0.0.0.0',
          replset   => 'foo',
          shardsvr  => true,
        }->
        mongodb_replset { 'foo' :
          members => ["shard:27018"],
        }
        if $::osfamily == 'RedHat' {
          class { 'mongodb::client': }
        }
      EOS

      apply_manifest_on(hosts_as('shard'), pp, :catch_failures => true)
      apply_manifest_on(hosts_as('shard'), pp, :catch_changes  => true)
    end

    it 'configures the router server' do
      pp = <<-EOS
        class { 'mongodb::globals': }
        -> class { 'mongodb::server':
          bind_ip   => '0.0.0.0',
          configsvr => true,
        } ->
        class { 'mongodb::mongos' :
          configdb => ["router:27019"],
        } ->
        exec { '/bin/sleep 20' :
        } ->
        mongodb_shard { 'foo':
          member => 'foo/shard:27018',
          keys   => [{'foo.toto' => {'name' => 1}}]
        }
        if $::osfamily == 'RedHat' {
          class { 'mongodb::client': }
        }
      EOS

      apply_manifest_on(hosts_as('router'), pp, :catch_failures => true)
      on(hosts_as('router'), 'mongo --quiet --eval "printjson(sh.status())"') do |r|
        expect(r.stdout).to match /foo\/shard:27018/
        expect(r.stdout).to match /foo\.toto/
      end
    end

  end
end
