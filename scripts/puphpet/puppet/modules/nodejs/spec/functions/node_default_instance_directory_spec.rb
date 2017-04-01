require 'spec_helper'

describe 'node_default_instance_directory' do
  before(:each) do
    Puppet::Parser::Functions.function(:node_default_instance_directory)
  end

  describe 'get link' do
    it do
      link_target = '/usr/local/node/node-v5.4.0'
      input       = '/usr/local/node'

      File.expects(:readlink).at_least(1).returns(link_target)
      File.expects(:exist?).at_least(1).returns(true)
      should run.with_params(input).and_return(link_target)
    end
  end
end
