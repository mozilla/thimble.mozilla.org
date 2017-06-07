source ENV['GEM_SOURCE'] || "https://rubygems.org"

def location_for(place, fake_version = nil)
  if place =~ /^(git:[^#]*)#(.*)/
    [fake_version, { :git => $1, :branch => $2, :require => false }].compact
  elsif place =~ /^file:\/\/(.*)/
    ['>= 0', { :path => File.expand_path($1), :require => false }]
  else
    [place, { :require => false }]
  end
end

is_ruby18 = RUBY_VERSION.start_with? '1.8'

group :development, :test do
  gem 'rake',                    :require => false
  if is_ruby18
    gem 'rspec', "~> 3.1.0",     :require => false
  end
  gem 'rspec-puppet',            :require => false
  gem 'puppetlabs_spec_helper',  :require => false
  gem 'puppet-lint',             :require => false
  gem 'pry',                     :require => false
  gem 'simplecov',               :require => false
  gem 'metadata-json-lint',      :require => false
end

beaker_version = ENV['BEAKER_VERSION']
group :system_tests do
  gem 'serverspec',              :require => false
  if beaker_version
    gem 'beaker', *location_for(beaker_version)
  else
    gem 'beaker',                :require => false
  end
  gem 'beaker-rspec',            :require => false
end

facter_version = ENV['FACTER_GEM_VERSION']
if facter_version
  gem 'facter', *location_for(facter_version)
else
  gem 'facter', :require => false
end

puppet_version = ENV['PUPPET_GEM_VERSION']
if puppet_version
  gem 'puppet', *location_for(puppet_version)
else
  gem 'puppet', :require => false
end

# vim:ft=ruby
