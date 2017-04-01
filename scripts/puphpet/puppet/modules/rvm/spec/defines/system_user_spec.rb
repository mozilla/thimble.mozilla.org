require 'spec_helper'

describe 'rvm::system_user' do

  let(:username) { 'johndoe' }
  let(:group) { 'rvm' }
  let(:title) { username }

  context "when using default parameters", :compile do
    it { should contain_user(username) }
    it { should contain_group(group) }
    it { should contain_exec("rvm-system-user-#{username}").with_command("/usr/sbin/usermod -a -G #{group} #{username}") }
  end

  context "when using default parameters on FreeBSD", :compile do
    let(:facts) {{
        :osfamily => 'FreeBSD',
      }}

    it { should contain_user(username) }
    it { should contain_group(group) }
    it { should contain_exec("rvm-system-user-#{username}").with_command("/usr/sbin/pw groupmod #{group} -m #{username}") }
  end

  context "when using default parameters on Darwin", :compile do
    let(:facts) {{
        :osfamily => 'Darwin',
      }}

    it { should contain_user(username) }
    it { should contain_group(group) }
    it { should contain_exec("rvm-system-user-#{username}").with_command("/usr/sbin/dseditgroup -o edit -a #{username} -t user #{group}") }
  end
end
