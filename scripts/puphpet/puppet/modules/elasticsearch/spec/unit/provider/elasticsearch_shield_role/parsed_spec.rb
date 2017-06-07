require 'spec_helper'

describe Puppet::Type.type(:elasticsearch_shield_role).provider(:parsed) do

  describe 'instances' do
    it 'should have an instance method' do
      expect(described_class).to respond_to :instances
    end

    context 'with no roles' do
      it 'should return no resources' do
        expect(described_class.parse("\n")).to eq([])
      end
    end

    context 'with one role' do
      it 'should return one resource' do
        expect(described_class.parse(%q{
          admin:
            cluster: all
            indices:
              '*': all
        })[0]).to eq({
          :ensure => :present,
          :name => 'admin',
          :privileges => {
            'cluster' => 'all',
            'indices' => {
              '*' => 'all',
            },
          },
        })
      end
    end

    context 'with multiple roles' do
      it 'should return three resources' do
        expect(described_class.parse(%q{
          admin:
            cluster: all
            indices:
              '*': all
          user:
            indices:
                '*': read
          power_user:
            cluster: monitor
            indices:
              '*': all
        }).length).to eq(3)
      end
    end
  end # of describe instances

  describe 'prefetch' do
    it 'should have a prefetch method' do
      expect(described_class).to respond_to :prefetch
    end
  end
end # of describe puppet type
