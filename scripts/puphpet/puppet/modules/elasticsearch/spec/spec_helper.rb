require 'puppetlabs_spec_helper/module_spec_helper'
require 'rspec-puppet-utils'
require 'rspec-puppet-facts'
include RspecPuppetFacts

def fixture_path
  File.expand_path(File.join(__FILE__, '..', 'fixtures'))
end

$LOAD_PATH.unshift(File.expand_path(File.dirname(__FILE__) + '/../'))

RSpec.configure do |c|
  c.add_setting :fixture_path, :default => fixture_path
  c.mock_with(:rspec)
  c.hiera_config = File.join(fixture_path, '/hiera/hiera.yaml')
end
