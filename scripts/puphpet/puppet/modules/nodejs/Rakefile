require 'puppetlabs_spec_helper/rake_tasks'
require 'puppet-lint/tasks/puppet-lint'
require 'puppet-syntax/tasks/puppet-syntax'

if RUBY_VERSION !~ /^1.8/
  require 'puppet_blacksmith/rake_tasks'
end

PuppetLint.configuration.log_format       = "%{path}:%{linenumber}:%{check}:%{KIND}:%{message}"
PuppetLint.configuration.fail_on_warnings = false
PuppetLint.configuration.send("disable_80chars")

exclude_paths = [
  "pkg/**/*",
  "vendor/**/*",
  "spec/**/*",
]

PuppetLint.configuration.ignore_paths = exclude_paths
PuppetSyntax.exclude_paths            = exclude_paths

desc "Run syntax, lint, and spec tests."
task :test => [
  :syntax,
  :lint,
  :spec,
]
