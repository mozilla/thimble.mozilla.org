require 'spec_helper'

describe 'plugin_dir' do

  describe 'exception handling' do
    describe 'with no arguments' do
      it { is_expected.to run.with_params()
        .and_raise_error(Puppet::ParseError) }
    end

    describe 'more than two arguments' do
      it { is_expected.to run.with_params('a', 'b', 'c')
        .and_raise_error(Puppet::ParseError) }
    end

    describe 'non-string arguments' do
      it { is_expected.to run.with_params([])
        .and_raise_error(Puppet::ParseError) }
    end
  end

  {
    'mobz/elasticsearch-head' => 'head',
    'lukas-vlcek/bigdesk/2.4.0' => 'bigdesk',
    'elasticsearch/elasticsearch-cloud-aws/2.5.1' => 'cloud-aws',
    'com.sksamuel.elasticsearch/elasticsearch-river-redis/1.1.0' => 'river-redis',
    'com.github.lbroudoux.elasticsearch/amazon-s3-river/1.4.0' => 'amazon-s3-river',
    'elasticsearch/elasticsearch-lang-groovy/2.0.0' => 'lang-groovy',
    'royrusso/elasticsearch-hq' => 'hq',
    'polyfractal/elasticsearch-inquisitor' => 'inquisitor',
    'mycustomplugin' => 'mycustomplugin'
  }.each do |plugin, dir|
    describe "parsed dir for #{plugin}" do
      it { is_expected.to run.with_params(plugin).and_return(dir) }
    end
  end

end
