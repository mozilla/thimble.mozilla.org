require 'puppetlabs_spec_helper/module_spec_helper'
require 'rspec-puppet-facts'
include RspecPuppetFacts

RSpec.configure do |c|
  c.default_facts = {
    :concat_basedir => '/tmp',
    :is_pe => false,
    :selinux_config_mode => 'disabled',
    :puppetversion => Puppet.version,
    :facterversion => Facter.version,
    :ipaddress => '172.16.254.254',
    :macaddress => 'AA:AA:AA:AA:AA:AA'
  }
end
# vim: syntax=ruby
