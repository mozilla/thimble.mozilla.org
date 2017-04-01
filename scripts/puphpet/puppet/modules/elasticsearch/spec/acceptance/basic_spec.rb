require 'spec_helper_acceptance'

# Here we put the more basic fundamental tests, ultra obvious stuff.

describe file("#{default['distmoduledir']}/elasticsearch/metadata.json") do
  it { should be_file }
end
