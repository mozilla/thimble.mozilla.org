require 'spec_helper'

describe Puppet::Type.type(:mongodb_shard).provider(:mongo) do

  let(:resource) do
    Puppet::Type.type(:mongodb_shard).new(
      { :ensure        => :present,
        :name          => 'rs_test',
        :member        => 'rs_test/mongo1:27018',
        :keys          => [],
        :provider      => :mongo
      }
    )
  end

  let(:provider) { resource.provider  }
  let(:instance) { provider.class.instances.first }

  let(:parsed_shards) { %w(rs_test) }

  let(:raw_shards) do
    {
      "sharding version" => {
        "_id"  => 1,
        "version"  => 4,
        "minCompatibleVersion"  => 4,
        "currentVersion"  => 5,
        "clusterId"  => "ObjectId(\'548e9110f3aca177c94c5e49\')"
      },
      "shards" => [
        {  "_id" => "rs_test",  "host" => "rs_test/mongo1:27018" }
      ],
      "databases" => [
        {  "_id" => "admin",  "partitioned" => false,  "primary" => "config" },
        {  "_id" => "test",  "partitioned" => false,  "primary" => "rs_test" },
        {  "_id" => "rs_test",  "partitioned" => true,  "primary" => "rs_test" }
      ]
    }
  end

  before :each do
     provider.class.stubs(:mongo_command).with('sh.status()').returns(raw_shards)
  end

  describe 'self.instances' do

    it 'should create a shard' do
      shards = provider.class.instances.collect { |x| x.name }
      expect(parsed_shards).to match_array(shards)
    end

  end

  describe '#create' do
    it 'makes a shard' do
      provider.expects('sh_addshard').with("rs_test/mongo1:27018").returns(
        { "shardAdded" => "rs_test",
          "ok" => 1 }
      )
      provider.expects('sh_enablesharding').with("rs_test").returns(
        { "ok" => 1 }
      )
      provider.create
      provider.flush
    end
  end

  describe 'destroy' do
    it 'removes a shard' do
    end
  end

  describe 'exists?' do
    it 'checks if shard exists' do
      instance.exists?
    end
  end

end
