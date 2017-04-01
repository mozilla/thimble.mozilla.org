require 'spec_helper'

describe Puppet::Type.type(:postgresql_replication_slot) do
  subject do
    Puppet::Type.type(:postgresql_psql).new({:name => 'standby'})
  end

  it 'should have a name parameter' do
    expect(subject[:name]).to eq 'standby'
  end
end
