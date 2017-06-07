require 'spec_helper'
require 'yaml'

class String
  def config
    "### MANAGED BY PUPPET ###\n---#{unindent}"
  end

  def unindent
    gsub(/^#{scan(/^\s*/).min_by{|l|l.length}}/, "")
  end
end

describe 'elasticsearch.yml.erb' do

  let :harness do
    TemplateHarness.new(
      'templates/etc/elasticsearch/elasticsearch.yml.erb'
    )
  end

  it 'should render normal hashes' do
    harness.set(
      '@data', {
        'node.name' => 'test',
        'path.data' => '/mnt/test',
        'discovery.zen.ping.unicast.hosts' => [
          'host1', 'host2'
        ]
      }
    )

    expect( YAML.load(harness.run) ).to eq( YAML.load(%q{
      discovery.zen.ping.unicast.hosts:
        - host1
        - host2
      node.name: test
      path.data: /mnt/test
      }.config))
  end

  it 'should render arrays of hashes correctly' do
    harness.set(
      '@data', {
        'data' => [
          { 'key' => 'value0',
            'other_key' => 'othervalue0' },
          { 'key' => 'value1',
            'other_key' => 'othervalue1' }
        ]
      }
    )

    expect( YAML.load(harness.run) ).to eq( YAML.load(%q{
      data:
      - key: value0
        other_key: othervalue0
      - key: value1
        other_key: othervalue1
      }.config))
  end

  it 'should quote IPv6 loopback addresses' do
    harness.set(
      '@data', {
        'network.host' => ['::', '[::]']
      }
    )

    expect( YAML.load(harness.run) ).to eq( YAML.load(%q{
      network.host:
        - "::"
        - "[::]"
      }.config))
  end

end
