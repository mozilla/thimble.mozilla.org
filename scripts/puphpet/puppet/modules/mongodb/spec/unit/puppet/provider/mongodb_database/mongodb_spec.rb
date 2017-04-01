require 'spec_helper'
require 'tempfile'

describe Puppet::Type.type(:mongodb_database).provider(:mongodb) do

  let(:raw_dbs) {
    {
      "databases" => [
        {
          "name"       => "admin",
          "sizeOnDisk" => 83886080,
          "empty"      => false
        }, {
          "name"       => "local",
          "sizeOnDisk" => 83886080,
          "empty"      => false
        }
      ],
      "totalSize" => 251658240,
      "ok" => 1
    }.to_json
  }

  let(:parsed_dbs) { %w(admin local) }

  let(:resource) { Puppet::Type.type(:mongodb_database).new(
    { :ensure   => :present,
      :name     => 'new_database',
      :provider => described_class.name
    }
  )}

  let(:provider) { resource.provider }

  before :each do
    tmp = Tempfile.new('test')
    @mongodconffile = tmp.path
    allow(provider.class).to receive(:get_mongod_conf_file).and_return(@mongodconffile)
    provider.class.stubs(:mongo_eval).with('printjson(db.getMongo().getDBs())').returns(raw_dbs)
    allow(provider.class).to receive(:db_ismaster).and_return(true)
  end

  let(:instance) { provider.class.instances.first }

  describe 'self.instances' do
    it 'returns an array of dbs' do
      dbs = provider.class.instances.collect {|x| x.name }
      expect(parsed_dbs).to match_array(dbs)
    end
  end

  describe 'create' do
    it 'makes a database' do
      provider.expects(:mongo_eval)
      provider.create
    end
  end

  describe 'destroy' do
    it 'removes a database' do
      provider.expects(:mongo_eval)
      provider.destroy
    end
  end

  describe 'exists?' do
    it 'checks if database exists' do
      instance.exists?
    end
  end

end
