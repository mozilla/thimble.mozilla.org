require 'puppetlabs_spec_helper/module_spec_helper'

# SimpleCov does not run on Ruby 1.8.7
unless RUBY_VERSION.to_f < 1.9
  require 'simplecov'
  require 'simplecov-console'
  SimpleCov.formatters = [
    SimpleCov::Formatter::HTMLFormatter,
    SimpleCov::Formatter::Console,
  ]
  SimpleCov.start do
    coverage_dir('coverage/')
    add_filter('/spec/')
  end
end

RSpec.configure do |config|
  config.hiera_config = 'spec/fixtures/hiera/hiera.yaml'
end

at_exit { RSpec::Puppet::Coverage.report! }
