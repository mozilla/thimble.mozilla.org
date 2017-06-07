require 'spec_helper_system'

describe 'install gnupg:' do

  it 'test loading class with no arguments' do
    pp = <<-EOS.unindent
      class {'gnupg':}
    EOS

    puppet_apply(pp) do |r|
      r.exit_code.should == 0
      r.refresh
      r.exit_code.should == 0
    end
  end
end
