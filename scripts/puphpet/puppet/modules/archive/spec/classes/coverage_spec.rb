require 'rspec-puppet'

at_exit { RSpec::Puppet::Coverage.report! }
# vim: syntax=ruby
