require 'puppetlabs_spec_helper/rake_tasks'
require 'puppet-lint'

PuppetLint.configuration.fail_on_warnings = true
PuppetLint.configuration.send('relative')
PuppetLint.configuration.send("disable_80chars")
PuppetLint.configuration.send('disable_class_inherits_from_params_class')
