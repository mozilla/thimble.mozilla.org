require 'spec_helper'

describe Puppet::Type.type(:elasticsearch_plugin).provider(:plugin) do

  let(:resource_name) { "lmenezes/elasticsearch-kopf" }

  describe "input validation" do

    let(:type) { Puppet::Type.type(:elasticsearch_plugin) }

    before do
      Process.stubs(:euid).returns 0
      Puppet::Util::Storage.stubs(:store)
    end

    it "should default to being installed" do
      plugin = Puppet::Type.type(:elasticsearch_plugin).new(:name => resource_name )
      expect(plugin.should(:ensure)).to eq(:present)
    end

    describe "when validating attributes" do
      [:name, :source, :url, :proxy].each do |param|
        it "should have a #{param} parameter" do
          expect(type.attrtype(param)).to eq(:param)
        end
      end

      it "should have an ensure property" do
        expect(type.attrtype(:ensure)).to eq(:property)
      end
    end

  end

end

describe 'other tests' do

  prov_c = Puppet::Type.type(:elasticsearch_plugin).provider(:plugin)

  describe prov_c do

    it 'should install a plugin' do
      resource = Puppet::Type.type(:elasticsearch_plugin).new(
        :name => "lmenezes/elasticsearch-kopf",
        :ensure => :present
      )
      allow(File).to receive(:open)
      provider = prov_c.new(resource)
      provider.expects(:es)
        .with('-version')
        .returns('Version: 1.7.3, Build: b88f43f/2015-07-29T09:54:16Z, JVM: 1.7.0_79')
      provider.expects(:plugin).with([
        'install',
        'lmenezes/elasticsearch-kopf'
      ])
      provider.create
    end

  end
end
