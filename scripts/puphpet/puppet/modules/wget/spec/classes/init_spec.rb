require 'spec_helper'

describe 'wget' do

  let(:facts) { {
    :operatingsystem => 'CentOS',
    :kernel => 'Linux'
  } }

  context 'no version specified', :compile do
    it { should contain_package('wget').with_ensure('present') }
  end

  context 'manage_package => false', :compile do
    let(:params) { {:manage_package => false } }
    it { should_not contain_package('wget').with_ensure('present') }
  end

  context 'version is present', :compile do
    let(:params) { {:version => 'present'} }

    it { should contain_package('wget').with_ensure('present') }
  end

  context 'running on OS X', :compile do
    let(:facts) { {
      :operatingsystem => 'Darwin',
      :kernel => 'Darwin'
    } }

    it { should_not contain_package('wget') }
  end

  context 'running on FreeBSD', :compile do
    let(:facts) { {
      :operatingsystem => 'FreeBSD',
      :kernel => 'FreeBSD'
    } }

    it { should contain_package('ftp/wget') }
  end
end
