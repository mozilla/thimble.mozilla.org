require 'puppetlabs_spec_helper/rake_tasks'
require 'puppet-lint/tasks/puppet-lint'

PuppetLint.configuration.send('relative')
PuppetLint.configuration.send("disable_80chars")
PuppetLint.configuration.send('disable_class_parameter_defaults')
PuppetLint.configuration.send('disable_class_inherits_from_params_class')
PuppetLint.configuration.send('disable_documentation')
PuppetLint.configuration.log_format = "%{path}:%{linenumber}:%{check}:%{KIND}:%{message}"

PuppetLint.configuration.fail_on_warnings = true
PuppetLint.configuration.ignore_paths = ["pkg/**/*", "vendor/**/*", "spec/**/*"]

desc "Run syntax, lint, and beaker tests."
task :test => [:validate, :lint, :spec]

