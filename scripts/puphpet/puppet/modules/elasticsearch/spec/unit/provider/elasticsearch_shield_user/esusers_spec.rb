require 'spec_helper'

describe Puppet::Type.type(:elasticsearch_shield_user).provider(:esusers) do

  describe 'instances' do
    it 'should have an instance method' do
      expect(described_class).to respond_to :instances
    end

    context 'without users' do
      before do
        described_class.expects(:esusers_with_path).with('list').returns(
          'No users found'
        )
      end

      it 'should return no resources' do
        expect(described_class.instances.size).to eq(0)
      end
    end

    context 'with one user' do
      before do
        described_class.expects(:esusers_with_path).with('list').returns(
          'elastic        : admin*,power_user'
        )
      end

      it 'should return one resource' do
        expect(described_class.instances[0].instance_variable_get(
          "@property_hash"
        )).to eq({
          :ensure => :present,
          :name => 'elastic',
          :provider => :esusers,
        })
      end
    end

    context 'with multiple users' do
      before do
        described_class.expects(
          :esusers_with_path
        ).with('list').returns(<<-EOL
          elastic        : admin*
          logstash       : user
          kibana         : kibana
        EOL
        )
      end

      it 'should return three resources' do
        expect(described_class.instances.length).to eq(3)
      end
    end
  end # of describe instances

  describe 'prefetch' do
    it 'should have a prefetch method' do
      expect(described_class).to respond_to :prefetch
    end
  end
end # of describe puppet type
