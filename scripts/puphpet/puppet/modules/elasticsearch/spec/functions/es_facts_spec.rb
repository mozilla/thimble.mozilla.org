require 'spec_helper'
require 'webmock/rspec'

describe 'elasticsearch facts' do

  before(:each) do
    ['Warlock', 'Zom'].each_with_index do |instance, n|
      stub_request(:get, "http://localhost:920#{n}/")
        .with(:headers => {'Accept'=>'*/*', 'User-Agent'=>'Ruby'})
        .to_return(
          :status => 200,
          :body => File.read(File.join(
            fixture_path, "facts/#{instance}-root.json"))
        )

      stub_request(:get, "http://localhost:920#{n}/_nodes/#{instance}")
        .with(:headers => {'Accept'=>'*/*', 'User-Agent'=>'Ruby'})
        .to_return(
          :status => 200,
          :body => File.read(File.join(
            fixture_path, "facts/#{instance}-nodes.json"))
        )
    end

    allow(File)
      .to receive(:directory?)
      .with('/etc/elasticsearch')
      .and_return(true)

    allow(Dir)
      .to receive(:foreach)
      .and_yield('es01').and_yield('es02')

    ['es01', 'es02'].each do |instance|
      allow(File)
        .to receive(:exists?)
        .with("/etc/elasticsearch/#{instance}/elasticsearch.yml")
        .and_return(true)
    end

    allow(YAML)
      .to receive(:load_file)
      .with('/etc/elasticsearch/es01/elasticsearch.yml', any_args)
      .and_return({})

    allow(YAML)
      .to receive(:load_file)
      .with('/etc/elasticsearch/es02/elasticsearch.yml', any_args)
      .and_return({'http.port' => '9201'})

    require 'lib/facter/es_facts'
  end

  describe 'elasticsearch_ports' do
    it 'finds listening ports' do
      expect(Facter.fact(:elasticsearch_ports).value.split(','))
        .to contain_exactly('9200', '9201')
    end
  end

  describe 'instance' do

    it 'returns the node name' do
      expect(Facter.fact(:elasticsearch_9200_name).value).to eq('Warlock')
    end

    it 'returns the node version' do
      expect(Facter.fact(:elasticsearch_9200_version).value).to eq('1.4.2')
    end

    it 'returns the cluster name' do
      expect(Facter.fact(:elasticsearch_9200_cluster_name).value)
        .to eq('elasticsearch')
    end

    it 'returns the node ID' do
      expect(Facter.fact(:elasticsearch_9200_node_id).value)
        .to eq('yQAWBO3FS8CupZnSvAVziQ')
    end

    it 'returns the mlockall boolean' do
      expect(Facter.fact(:elasticsearch_9200_mlockall).value).to be_falsy
    end

    it 'returns installed plugins' do
      expect(Facter.fact(:elasticsearch_9200_plugins).value).to eq('kopf')
    end

    describe 'kopf plugin' do

      it 'returns the correct version' do
        expect(Facter.fact(:elasticsearch_9200_plugin_kopf_version).value)
          .to eq('1.4.3')
      end

      it 'returns the correct description' do
        expect(Facter.fact(:elasticsearch_9200_plugin_kopf_description).value)
          .to eq('kopf - simple web administration tool for ElasticSearch')
      end

      it 'returns the plugin URL' do
        expect(Facter.fact(:elasticsearch_9200_plugin_kopf_url).value)
          .to eq('/_plugin/kopf/')
      end

      it 'returns the plugin JVM boolean' do
        expect(Facter.fact(:elasticsearch_9200_plugin_kopf_jvm).value)
          .to be_falsy
      end

      it 'returns the plugin _site boolean' do
        expect(Facter.fact(:elasticsearch_9200_plugin_kopf_site).value)
          .to be_truthy
      end

    end # of describe plugin
  end # of describe instance
end # of describe elasticsearch facts
