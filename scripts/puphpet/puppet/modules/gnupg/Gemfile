source ENV['GEM_SOURCE'] || "https://rubygems.org"

group :development, :test do
  gem 'rake',                   :require => false
  gem 'rspec-core','~> 3.1.7',  :require => false
  gem 'rspec-puppet',           :require => false
  gem 'puppetlabs_spec_helper', :require => false
  gem 'puppet-lint',            :require => false
  gem 'puppet_facts',           :require => false
  gem 'json',                   :require => false
  gem 'metadata-json-lint',     :require => false
end

group :system_tests do
  gem 'beaker', '~> 2.4',    :require => false
  gem 'beaker-rspec',        :require => false
  gem 'serverspec',          :require => false
  gem 'rspec-system-puppet', :require => false
end

if facterversion = ENV['FACTER_GEM_VERSION']
  gem 'facter', facterversion, :require => false
else
  gem 'facter', :require => false
end

if puppetversion = ENV['PUPPET_GEM_VERSION']
  gem 'puppet', puppetversion, :require => false
else
  gem 'puppet', :require => false
end

# vim:ft=ruby
