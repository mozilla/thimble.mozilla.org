shared_examples 'RedHat' do
  let(:facts) {{ :osfamily => "RedHat", :operatingsystemmajrelease => '6' }}

  describe "when using default class parameters" do
    let(:params) {{ }}

    it { should create_class('timezone') }
    it { should contain_class('timezone::params') }

    it do
      should contain_package('tzdata').with({
        :ensure => 'present',
        :before => 'File[/etc/localtime]',
      })
    end


    it { should contain_file('/etc/sysconfig/clock').with_ensure('file') }
    it { should contain_file('/etc/sysconfig/clock').with_content(/^ZONE="UTC"$/) }
    it { should_not contain_exec('update_timezone') }

    it do
      should contain_file('/etc/localtime').with({
        :ensure => 'link',
        :target => '/usr/share/zoneinfo/UTC',
      })
    end

    context 'when timezone => "Europe/Berlin"' do
      let(:params) {{ :timezone => "Europe/Berlin" }}

      it { should contain_file('/etc/sysconfig/clock').with_content(/^ZONE="Europe\/Berlin"$/) }
      it { should contain_file('/etc/localtime').with_target('/usr/share/zoneinfo/Europe/Berlin') }
    end

    context 'when autoupgrade => true' do
      let(:params) {{ :autoupgrade => true }}
      it { should contain_package('tzdata').with_ensure('latest') }
    end

    context 'when ensure => absent' do
      let(:params) {{ :ensure => 'absent' }}
      it { should contain_package('tzdata').with_ensure('present') }
      it { should contain_file('/etc/sysconfig/clock').with_ensure('absent') }
      it { should contain_file('/etc/localtime').with_ensure('absent') }
    end

    context 'when RHEL 7' do
      let(:facts) {{ :osfamily => "RedHat", :operatingsystemmajrelease => '7' }}
      it { should_not contain_file('/etc/sysconfig/clock').with_ensure('file') }
    end

    include_examples 'validate parameters'
  end
end
