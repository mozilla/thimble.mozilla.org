source 'http://rubygems.org'

group :test do
  if puppetversion = ENV['PUPPET_GEM_VERSION']
    gem 'puppet', puppetversion, :require => false
  else
    gem 'puppet', ENV['PUPPET_VERSION'] || '~> 3.8.0'
  end

  # rspec must be v2 for ruby 1.8.7
  if RUBY_VERSION >= '1.8.7' and RUBY_VERSION < '1.9'
    gem 'rspec', '~> 2.0'
  end

  gem 'rake'
  gem 'puppet-lint'
  gem 'rspec-puppet', :git => 'https://github.com/rodjek/rspec-puppet.git'
  gem 'puppet-syntax'
  gem 'puppetlabs_spec_helper'
  gem 'simplecov'
  gem 'simplecov-console'
  gem 'metadata-json-lint'
end

group :development do
  gem 'travis'
  gem 'travis-lint'
  gem 'puppet-blacksmith'
  gem 'guard-rake'
  gem 'listen', '<= 3.0.6', :require => false
end

group :system_tests do
  gem "beaker",
    :git => 'https://github.com/puppetlabs/beaker',
    :ref => '0a7b948aeef8a422e7a86f34012f00166f1dda81',
    :require => false
  gem "beaker-rspec",
    :git => 'https://github.com/puppetlabs/beaker-rspec.git',
    :ref => 'a617f7bbc3e6ebb6ce49df32749d4ce93cef737d',
    :require => false
  gem 'signet', git: "https://github.com/google/signet.git"
  gem 'serverspec'
  gem 'specinfra'
end

