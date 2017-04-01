require 'puppet'
require 'puppet/type/mongodb_shard'
describe Puppet::Type.type(:mongodb_shard) do

  before :each do
    @shard = Puppet::Type.type(:mongodb_shard).new(:name => 'test')
  end

  it 'should accept a shard name' do
    expect(@shard[:name]).to eq('test')
  end

  it 'should accept a member' do
    @shard[:member] = 'rs_test/mongo1:27017'
    expect(@shard[:member]).to eq('rs_test/mongo1:27017')
  end

  it 'should accept a keys array' do
    @shard[:keys] = [{'foo.bar' => {'name' => 1}}]
    expect(@shard[:keys]).to eq([{'foo.bar' => {'name' => 1}}])
  end

  it 'should require a name' do
    expect {
      Puppet::Type.type(:mongodb_shard).new({})
    }.to raise_error(Puppet::Error, 'Title or name must be provided')
  end

end
