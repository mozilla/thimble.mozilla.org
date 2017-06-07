require 'spec_helper'
require 'webmock/rspec'

describe Puppet::Type.type(:elasticsearch_template).provider(:ruby) do

  describe 'instances' do
    context 'with no templates' do
      before :all do
        stub_request(:get, 'http://localhost:9200/_template').
          to_return(
            :status => 200,
            :body => '{}'
        )
      end

      it 'returns an empty list' do
        expect(described_class.instances).to eq([])
      end
    end
  end

  describe 'multiple templates' do
    before :all do
      stub_request(:get, 'http://localhost:9200/_template').
        to_return(
          :status => 200,
          :body => <<-EOS
            {
              "foobar1": {
                "aliases": {},
                "mappings": {},
                "order": 1,
                "settings": {},
                "template": "foobar1-*"
              },
              "foobar2": {
                "aliases": {},
                "mappings": {},
                "order": "2",
                "settings": {},
                "template": "foobar2-*"
              }
            }
          EOS
      )
    end

    it 'returns two templates' do
      expect(described_class.instances.map { |provider|
        provider.instance_variable_get(:@property_hash)
      }).to contain_exactly({
        :name => 'foobar1',
        :ensure => :present,
        :provider => :ruby,
        :content => {
          'aliases' => {},
          'mappings' => {},
          'settings' => {},
          'template' => 'foobar1-*',
          'order' => 1,
        }
      },{
        :name => 'foobar2',
        :ensure => :present,
        :provider => :ruby,
        :content => {
          'aliases' => {},
          'mappings' => {},
          'settings' => {},
          'template' => 'foobar2-*',
          'order' => 2,
        }
      })
    end
  end

  describe 'basic authentication' do
    before :all do
      stub_request(:get, 'http://localhost:9200/_template').
        with(:basic_auth => ['elastic', 'password']).
        to_return(
          :status => 200,
          :body => <<-EOS
            {
              "foobar3": {
                "aliases": {},
                "mappings": {},
                "order": 3,
                "settings": {},
                "template": "foobar3-*"
              }
            }
          EOS
      )
    end

    it 'authenticates' do
      expect(described_class.templates(
        'http', true, 'localhost', '9200', 10, 'elastic', 'password'
      ).map { |provider|
        described_class.new(
          provider
        ).instance_variable_get(:@property_hash)
      }).to contain_exactly({
        :name => 'foobar3',
        :ensure => :present,
        :provider => :ruby,
        :content => {
          'aliases' => {},
          'mappings' => {},
          'settings' => {},
          'template' => 'foobar3-*',
          'order' => 3,
        }
      })
    end
  end

  describe 'https' do
    before :all do
      stub_request(:get, 'https://localhost:9200/_template').
        to_return(
          :status => 200,
          :body => <<-EOS
            {
              "foobar-ssl": {
                "aliases": {},
                "mappings": {},
                "order": 10,
                "settings": {},
                "template": "foobar-ssl-*"
              }
            }
          EOS
      )
    end

    it 'uses ssl' do
      expect(described_class.templates(
        'https', true, 'localhost', '9200', 10
      ).map { |provider|
        described_class.new(
          provider
        ).instance_variable_get(:@property_hash)
      }).to contain_exactly({
        :name => 'foobar-ssl',
        :ensure => :present,
        :provider => :ruby,
        :content => {
          'aliases' => {},
          'mappings' => {},
          'settings' => {},
          'template' => 'foobar-ssl-*',
          'order' => 10,
        }
      })
    end
  end

end # of describe puppet type
