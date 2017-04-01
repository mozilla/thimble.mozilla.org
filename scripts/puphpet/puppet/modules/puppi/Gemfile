source 'https://rubygems.org'

if facterversion = ENV['FACTER_GEM_VERSION']
  gem 'facter', facterversion, :require => false
else
  gem 'facter', :require => false
end

if puppetversion = ENV['PUPPET_GEM_VERSION']
  gem 'puppet', puppetversion, :require => false
  # Puppet 2.7 and Ruby 1.8 fails with newer rspec
  gem 'rspec', '~>3.1.0', :require => false, :platform => [:ruby_18]
else
  gem 'puppet', :require => false
end


gem 'puppet-lint'
gem 'puppetlabs_spec_helper', '>= 0.1.0'

# vim:ft=ruby
