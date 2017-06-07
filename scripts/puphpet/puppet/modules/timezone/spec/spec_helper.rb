require 'puppetlabs_spec_helper/module_spec_helper'
require 'pathname'

dir = Pathname.new(__FILE__).parent
# Load all shared contexts and shared examples
Dir["#{dir}/support/**/*.rb"].sort.each {|f| require f}

at_exit { RSpec::Puppet::Coverage.report! }
