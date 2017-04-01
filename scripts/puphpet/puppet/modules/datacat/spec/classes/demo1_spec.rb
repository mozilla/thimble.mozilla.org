require 'spec_helper'

describe 'demo1' do
  it { should create_notify('demo1') }
  it { should create_datacat('/tmp/demo1').with_template('demo1/sheeps.erb') }
  it { should create_datacat_fragment('data foo => 1').with_data({'foo'=>'1'}) }
  it { should create_datacat_fragment('data bar => 2').with_data({'bar'=>'2'}) }
end
