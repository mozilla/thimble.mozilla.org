shared_examples 'Gentoo' do
  let(:facts) {{ :osfamily => "Gentoo" }}

  describe "when using default class parameters" do
    let(:params) {{ }}

    it { should create_class('timezone') }
    it { should contain_class('timezone::params') }

    it do
      should contain_package('sys-libs/timezone-data').with({
        :ensure => 'present',
        :before => 'File[/etc/localtime]',
      })
    end

    it { should contain_file('/etc/timezone').with_ensure('file') }
    it { should contain_file('/etc/timezone').with_content(/^UTC$/) }
    it { should contain_exec('update_timezone').with_command(/^emerge --config timezone-data$/) }
    it do
      should contain_file('/etc/localtime').with({
        :ensure => 'link',
        :target => '/usr/share/zoneinfo/UTC',
      })
    end

    context 'when timezone => "Europe/Berlin"' do
      let(:params) {{ :timezone => "Europe/Berlin" }}

      it { should contain_file('/etc/timezone').with_content(/^Europe\/Berlin$/) }
      it { should contain_file('/etc/localtime').with_target('/usr/share/zoneinfo/Europe/Berlin') }
    end

    context 'when autoupgrade => true' do
      let(:params) {{ :autoupgrade => true }}
      it { should contain_package('sys-libs/timezone-data').with_ensure('latest') }
    end

    context 'when ensure => absent' do
      let(:params) {{ :ensure => 'absent' }}
      it { should contain_package('sys-libs/timezone-data').with_ensure('present') }
      it { should contain_file('/etc/timezone').with_ensure('absent') }
      it { should contain_file('/etc/localtime').with_ensure('absent') }
    end

    include_examples 'validate parameters'
  end
end
