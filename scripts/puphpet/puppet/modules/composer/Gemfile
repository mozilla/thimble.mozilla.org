source 'https://rubygems.org'

if ENV.key?('PUPPET_VERSION')
  puppetversion = "= #{ENV['PUPPET_VERSION']}"
else
  puppetversion = ['>= 2.7']
end

gem 'puppet', puppetversion
gem 'puppetlabs_spec_helper'
gem 'rspec-puppet', :github => 'rodjek/rspec-puppet'
gem 'rspec', '< 3.0.0'
gem 'mocha'
gem 'puppet-lint'
gem 'hiera'
gem 'hiera-puppet'

group :test do
  gem 'beaker',                        :require => false
  gem 'beaker-rspec',                  :require => false
  gem 'beaker-puppet_install_helper',  :require => false
  if RUBY_VERSION =~ /^1\.8/
    gem 'rake', '< 11'
    gem 'addressable', '< 2.4'
  end
end
