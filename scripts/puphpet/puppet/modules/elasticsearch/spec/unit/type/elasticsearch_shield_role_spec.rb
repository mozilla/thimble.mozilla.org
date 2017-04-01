require 'spec_helper'

describe Puppet::Type.type(:elasticsearch_shield_role) do

  let(:resource_name) { 'elastic_role' }

  describe 'when validating attributes' do
    [:name].each do |param|
      it "should have a #{param} parameter" do
        expect(described_class.attrtype(param)).to eq(:param)
      end
    end

    [:ensure, :privileges].each do |prop|
      it "should have a #{prop} property" do
        expect(described_class.attrtype(prop)).to eq(:property)
      end
    end
  end # of describe when validating attributes

  describe 'when validating values' do
    describe 'ensure' do
      it 'should support present as a value for ensure' do
        expect { described_class.new(
          :name => resource_name,
          :ensure => :present,
        ) }.to_not raise_error
      end

      it 'should support absent as a value for ensure' do
        expect { described_class.new(
          :name => resource_name,
          :ensure => :absent,
        ) }.to_not raise_error
      end

      it 'should not support other values' do
        expect { described_class.new(
          :name => resource_name,
          :ensure => :foo,
        ) }.to raise_error(Puppet::Error, /Invalid value/)
      end
    end

    describe 'name' do
      it 'should reject long role names' do
        expect { described_class.new(
          :name => 'a'*31,
        ) }.to raise_error(
          Puppet::ResourceError,
          /valid values/i
        )
      end

      it 'should reject invalid role characters' do
        ['@foobar', '0foobar'].each do |role|
          expect { described_class.new(
            :name => role,
        ) }.to raise_error(
          Puppet::ResourceError,
          /valid values/i
        )
        end
      end
    end
  end # of describing when validing values
end # of describe Puppet::Type
