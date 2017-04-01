shared_examples 'FreeBSD' do
  let(:facts) {{ :osfamily => "FreeBSD" }}

  describe "when using default class parameters" do
    let(:params) {{ }}

    it { should create_class('timezone') }
    it { should contain_class('timezone::params') }

    it do
      should contain_file('/etc/localtime').with({
        :ensure => 'link',
        :target => '/usr/share/zoneinfo/UTC',
      })
    end

    context 'when timezone => "Europe/Berlin"' do
      let(:params) {{ :timezone => "Europe/Berlin" }}

      it { should contain_file('/etc/localtime').with_target('/usr/share/zoneinfo/Europe/Berlin') }
    end

    context 'when autoupgrade => true' do
      let(:params) {{ :autoupgrade => true }}
    end

    context 'when ensure => absent' do
      let(:params) {{ :ensure => 'absent' }}
      it { should contain_file('/etc/localtime').with_ensure('absent') }
    end

    include_examples 'validate parameters'
  end
end
