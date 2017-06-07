require 'spec_helper'

describe 'redis_server_version', type: :fact do
  before { Facter.clear }
  after { Facter.clear }

  it 'is 2.8.19 according to output' do
    Facter::Util::Resolution.stubs(:which).with('redis-server').returns('/usr/bin/redis-server')
    sample_redis_server_version = File.read(fixtures('facts', 'redis_server_version'))
    Facter::Util::Resolution.stubs(:exec).with('redis-server -v').returns(sample_redis_server_version)
    expect(Facter.fact(:redis_server_version).value).to eq('2.8.19')
  end

  it 'is empty string if redis-server not installed' do
    Facter::Util::Resolution.stubs(:which).with('redis-server').returns(nil)
    expect(Facter.fact(:redis_server_version).value).to eq(nil)
  end
end
