require 'spec_helper'

describe 'is_binary_download_available' do
  it { should run.with_params('v0.10.0').and_return(true) }
  it { should run.with_params('v0.10.1').and_return(true) }
  it { should run.with_params('v0.8.0').and_return(false) }
end
