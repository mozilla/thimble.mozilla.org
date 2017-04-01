require 'spec_helper'

describe 'git::gitosis' do

  context 'defaults' do
    it { should contain_package('gitosis') }
    it { should contain_class('git') }
    it { should create_class('git::gitosis') }
  end
end
