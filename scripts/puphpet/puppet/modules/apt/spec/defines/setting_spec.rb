require 'spec_helper'

describe 'apt::setting' do
  let(:pre_condition) { 'class { "apt": }' }
  let(:facts) { { :lsbdistid => 'Debian', :osfamily => 'Debian', :lsbdistcodename => 'wheezy', :puppetversion   => Puppet.version, } }
  let(:title) { 'conf-teddybear' }

  let(:default_params) { { :content => 'di' } }

  describe 'when using the defaults' do
    context 'without source or content' do
      it do
        expect { subject.call }.to raise_error(Puppet::Error, /needs either of /)
      end
    end

    context 'with title=conf-teddybear ' do
      let(:params) { default_params }
      it { is_expected.to contain_file('/etc/apt/apt.conf.d/50teddybear').that_notifies('Class[Apt::Update]') }
    end

    context 'with title=pref-teddybear' do
      let(:title) { 'pref-teddybear' }
      let(:params) { default_params }
      it { is_expected.to contain_file('/etc/apt/preferences.d/teddybear.pref').that_notifies('Class[Apt::Update]') }
    end

    context 'with title=list-teddybear' do
      let(:title) { 'list-teddybear' }
      let(:params) { default_params }
      it { is_expected.to contain_file('/etc/apt/sources.list.d/teddybear.list').that_notifies('Class[Apt::Update]') }
    end

    context 'with source' do
      let(:params) { { :source => 'puppet:///la/die/dah' } }
      it {
        is_expected.to contain_file('/etc/apt/apt.conf.d/50teddybear').that_notifies('Class[Apt::Update]').with({
        :ensure => 'file',
        :owner  => 'root',
        :group  => 'root',
        :mode   => '0644',
        :source => "#{params[:source]}",
      })}
    end

    context 'with content' do
      let(:params) { default_params }
      it { is_expected.to contain_file('/etc/apt/apt.conf.d/50teddybear').that_notifies('Class[Apt::Update]').with({
        :ensure  => 'file',
        :owner   => 'root',
        :group   => 'root',
        :mode    => '0644',
        :content => "#{params[:content]}",
      })}
    end
  end

  describe 'settings requiring settings, MODULES-769' do
    let(:pre_condition) do
      'class { "apt": }
      apt::setting { "list-teddybear": content => "foo" }
      '
    end
    let(:facts) { { :lsbdistid => 'Debian', :osfamily => 'Debian', :lsbdistcodename => 'wheezy', :puppetversion   => Puppet.version, } }
    let(:title) { 'conf-teddybear' }
    let(:default_params) { { :content => 'di' } }

    let(:params) { default_params.merge({ :require => 'Apt::Setting[list-teddybear]' }) }

    it { is_expected.to compile.with_all_deps }
  end

  describe 'when trying to pull one over' do
    context 'with source and content' do
      let(:params) { default_params.merge({ :source => 'la' }) }
      it do
        expect { subject.call }.to raise_error(Puppet::Error, /cannot have both /)
      end
    end

    context 'with title=ext-teddybear' do
      let(:title) { 'ext-teddybear' }
      let(:params) { default_params }
      it do
        expect { subject.call }.to raise_error(Puppet::Error, /must start with /)
      end
    end

    context 'with ensure=banana' do
      let(:params) { default_params.merge({ :ensure => 'banana' }) }
      it do
        expect { subject.call }.to raise_error(Puppet::Error, /"banana" does not /)
      end
    end

    context 'with priority=1.2' do
      let(:params) { default_params.merge({ :priority => 1.2 }) }
      it do
        expect { subject.call }.to raise_error(Puppet::Error, /be an integer /)
      end
    end
  end

  describe 'with priority=100' do
    let(:params) { default_params.merge({ :priority => 100 }) }
    it { is_expected.to contain_file('/etc/apt/apt.conf.d/100teddybear').that_notifies('Class[Apt::Update]') }
  end

  describe 'with ensure=absent' do
    let(:params) { default_params.merge({ :ensure => 'absent' }) }
    it { is_expected.to contain_file('/etc/apt/apt.conf.d/50teddybear').that_notifies('Class[Apt::Update]').with({
      :ensure => 'absent',
    })}
  end
end
