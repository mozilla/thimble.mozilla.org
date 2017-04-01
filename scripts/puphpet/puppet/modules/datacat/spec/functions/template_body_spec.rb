require 'spec_helper'

describe 'template_body' do
  it { should run.with_params('template_body/really_should_never_exist.erb').and_raise_error(Puppet::ParseError, /Could not find template 'template_body\/really_should_never_exist.erb'/) }
  it { should run.with_params('template_body/test1.erb').and_return("Goodbye cruel world\n") }
end
