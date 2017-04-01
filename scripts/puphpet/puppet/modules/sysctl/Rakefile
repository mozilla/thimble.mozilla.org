require 'rubygems'
require 'puppetlabs_spec_helper/rake_tasks'
require 'rake'
require 'rspec/core/rake_task'

task :default do
  system("rake -T")
end

task :specs => [:spec]

desc "Run all rspec-puppet tests"
RSpec::Core::RakeTask.new(:spec) do |t|
  t.rspec_opts = ['--color']
  # ignores fixtures directory.
  t.pattern = 'spec/{classes,defines,unit}/**/*_spec.rb'
end

