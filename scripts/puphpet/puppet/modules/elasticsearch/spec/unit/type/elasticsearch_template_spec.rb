require 'spec_helper'

describe Puppet::Type.type(:elasticsearch_template) do

  let(:resource_name) { 'test_template' }

  describe 'attribute validation' do
    [
      :name,
      :source,
      :host,
      :port,
      :protocol,
      :validate_tls,
      :timeout,
      :username,
      :password
    ].each do |param|
      it "should have a #{param} parameter" do
        expect(described_class.attrtype(param)).to eq(:param)
      end
    end

    [:content, :ensure].each do |prop|
      it "should have a #{prop} property" do
        expect(described_class.attrtype(prop)).to eq(:property)
      end
    end

    describe 'namevar validation' do
      it 'should have :name as its namevar' do
        expect(described_class.key_attributes).to eq([:name])
      end
    end

    describe 'content' do
      it 'should reject non-hash values' do
        expect { described_class.new(
          :name => resource_name,
          :content => '{"foo":}'
        ) }.to raise_error(Puppet::Error, /hash expected/i)

        expect { described_class.new(
          :name => resource_name,
          :content => 0
        ) }.to raise_error(Puppet::Error, /hash expected/i)

        expect { described_class.new(
          :name => resource_name,
          :content => {}
        ) }.not_to raise_error
      end

      it 'should deeply parse PSON-like values' do
        expect(described_class.new(
          :name => resource_name,
          :content => {'key'=>{'value'=>'0'}}
        )[:content]).to include(
          'key'=>{'value'=>0}
        )
      end
    end

    describe 'ensure' do
      it 'should support present as a value for ensure' do
        expect { described_class.new(
          :name => resource_name,
          :ensure => :present,
          :content => {}
        ) }.to_not raise_error
      end

      it 'should support absent as a value for ensure' do
        expect { described_class.new(
          :name => resource_name,
          :ensure => :absent
        ) }.to_not raise_error
      end

      it 'should not support other values' do
        expect { described_class.new(
          :name => resource_name,
          :ensure => :foo,
          :content => {}
        ) }.to raise_error(Puppet::Error, /Invalid value/)
      end
    end

    describe 'host' do
      it 'should accept IP addresses' do
        expect { described_class.new(
          :name => resource_name,
          :content => {},
          :host => '127.0.0.1'
        ) }.not_to raise_error
      end
    end

    describe 'port' do
      [-1, 0, 70000, 'foo'].each do |value|
        it "should reject invalid port value #{value}" do
          expect { described_class.new(
            :name => resource_name,
            :content => {},
            :port => value
          ) }.to raise_error(Puppet::Error, /invalid port/i)
        end
      end
    end

    describe 'validate_tls' do
      [-1, 0, {}, [], 'foo'].each do |value|
        it "should reject invalid ssl_verify value #{value}" do
          expect { described_class.new(
            :name => resource_name,
            :content => {},
            :validate_tls => value
          ) }.to raise_error(Puppet::Error, /invalid value/i)
        end
      end

      [true, false, 'true', 'false', 'yes', 'no'].each do |value|
        it "should accept validate_tls value #{value}" do
          expect { described_class.new(
            :name => resource_name,
            :content => {},
            :validate_tls => value
          ) }.not_to raise_error
        end
      end
    end

    describe 'timeout' do
      it 'should reject string values' do
        expect { described_class.new(
          :name => resource_name,
          :content => {},
          :timeout => 'foo'
        ) }.to raise_error(Puppet::Error, /must be a/)
      end

      it 'should reject negative integers' do
        expect { described_class.new(
          :name => resource_name,
          :content => {},
          :timeout => -10
        ) }.to raise_error(Puppet::Error, /must be a/)
      end

      it 'should accept integers' do
        expect { described_class.new(
          :name => resource_name,
          :content => {},
          :timeout => 10
        ) }.to_not raise_error
      end

      it 'should accept quoted integers' do
        expect { described_class.new(
          :name => resource_name,
          :content => {},
          :timeout => '10'
        ) }.to_not raise_error
      end
    end

    describe 'content and source validation' do
      it 'should require either "content" or "source"' do
        expect { described_class.new(
          :name => resource_name,
        ) }.to raise_error(Puppet::Error, /content.*or.*source.*required/)
      end

      it 'should fail with both defined' do
        expect { described_class.new(
          :name => resource_name,
          :content => {},
          :source => 'puppet:///example.json'
        ) }.to raise_error(Puppet::Error, /simultaneous/)
      end

      it 'should parse source paths into the content property' do
        file_stub = 'foo'
        [
          Puppet::FileServing::Metadata,
          Puppet::FileServing::Content
        ].each do |klass|
          allow(klass).to receive(:indirection)
            .and_return(Object)
        end
        allow(Object).to receive(:find)
          .and_return(file_stub)
        allow(file_stub).to receive(:content)
          .and_return('{"template":"foobar-*", "order": 1}')
        expect(described_class.new(
          :name => resource_name,
          :source => '/example.json'
        )[:content]).to include(
          'template' => 'foobar-*',
          'order' => 1
        )
      end

      it 'should qualify settings' do
        expect(described_class.new(
          :name => resource_name,
          :content => { 'settings' => {
            'number_of_replicas' => '2',
            'index' => { 'number_of_shards' => '3' }
          } }
        )[:content]).to eq({
          'order' => 0,
          'aliases' => {},
          'mappings' => {},
          'settings' => {
            'index' => {
              'number_of_replicas' => 2,
              'number_of_shards' => 3
            }
          }
        })
      end
    end
  end # of describing when validing values
end # of describe Puppet::Type
