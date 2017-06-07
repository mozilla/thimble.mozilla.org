require 'spec_helper'

describe 'is_npm_provided' do
  it { should run.with_params('v0.6.4').and_return(true) }
  it { should run.with_params('v0.6.3').and_return(true) }
  it { should run.with_params('v0.6.2').and_return(false) }
end
