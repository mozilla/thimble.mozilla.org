require 'puppet'
require 'puppet/type/mongodb_user'
describe Puppet::Type.type(:mongodb_user) do

  before :each do
    @user = Puppet::Type.type(:mongodb_user).new(
              :name => 'test',
              :database => 'testdb',
              :password_hash => 'pass')
  end

  it 'should accept a user name' do
    expect(@user[:name]).to eq('test')
  end

  it 'should accept a database name' do
    expect(@user[:database]).to eq('testdb')
  end

  it 'should accept a tries parameter' do
    @user[:tries] = 5
    expect(@user[:tries]).to eq(5)
  end

  it 'should accept a password' do
    @user[:password_hash] = 'foo'
    expect(@user[:password_hash]).to eq('foo')
  end

  it 'should use default role' do
    expect(@user[:roles]).to eq(['dbAdmin'])
  end

  it 'should accept a roles array' do
    @user[:roles] = ['role1', 'role2']
    expect(@user[:roles]).to eq(['role1', 'role2'])
  end

  it 'should require a name' do
    expect {
      Puppet::Type.type(:mongodb_user).new({})
    }.to raise_error(Puppet::Error, 'Title or name must be provided')
  end

  it 'should require a database' do
    expect {
      Puppet::Type.type(:mongodb_user).new({:name => 'test', :password_hash => 'pass'})
    }.to raise_error(Puppet::Error, 'Parameter \'database\' must be set')
  end

  it 'should require a password_hash' do
    expect {
      Puppet::Type.type(:mongodb_user).new({:name => 'test', :database => 'testdb'})
    }.to raise_error(Puppet::Error, 'Property \'password_hash\' must be set. Use mongodb_password() for creating hash.')
  end

  it 'should sort roles' do
    # Reinitialize type with explicit unsorted roles.
    @user = Puppet::Type.type(:mongodb_user).new(
              :name => 'test',
              :database => 'testdb',
              :password_hash => 'pass',
              :roles => ['b', 'a'])
    expect(@user[:roles]).to eq(['a', 'b'])
  end

end
