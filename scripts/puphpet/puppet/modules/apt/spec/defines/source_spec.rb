require 'spec_helper'

describe 'apt::source' do
  GPG_KEY_ID = '47B320EB4C7C375AA9DAE1A01054B7A24BD6EC30'

  let :pre_condition do
    'class { "apt": }'
  end

  let :title do
    'my_source'
  end

  context 'defaults' do
    context 'without location' do
      let :facts do
        {
          :lsbdistid       => 'Debian',
          :lsbdistcodename => 'wheezy',
          :osfamily        => 'Debian',
          :puppetversion   => Puppet.version,
        }
      end
      it do
        expect {
          subject.call
        }.to raise_error(Puppet::Error, /source entry without specifying a location/)
      end
    end
    context 'with location' do
      let :facts do
        {
          :lsbdistid       => 'Debian',
          :lsbdistcodename => 'wheezy',
          :osfamily        => 'Debian',
          :puppetversion   => Puppet.version,
        }
      end
      let(:params) { { :location => 'hello.there', } }

      it { is_expected.to contain_apt__setting('list-my_source').with({
        :ensure  => 'present',
      }).without_content(/# my_source\ndeb-src hello.there wheezy main\n/)
      }
    end
  end

  describe 'no defaults' do
    let :facts do
      {
        :lsbdistid       => 'Debian',
        :lsbdistcodename => 'wheezy',
        :osfamily        => 'Debian',
        :puppetversion   => Puppet.version,
      }
    end

    context 'with complex pin' do
      let :params do
        {
          :location => 'hello.there',
          :pin      => { 'release'     => 'wishwash',
                         'explanation' => 'wishwash',
                         'priority'    => 1001, },
        }
      end

      it { is_expected.to contain_apt__setting('list-my_source').with({
        :ensure => 'present',
      }).with_content(/hello.there wheezy main\n/)
      }

      it { is_expected.to contain_file('/etc/apt/sources.list.d/my_source.list').that_notifies('Class[Apt::Update]')}

      it { is_expected.to contain_apt__pin('my_source').that_comes_before('Apt::Setting[list-my_source]').with({
        :ensure       => 'present',
        :priority     => 1001,
        :explanation  => 'wishwash',
        :release      => 'wishwash',
      })
      }
    end

    context 'with simple key' do
      let :params do
        {
          :comment           => 'foo',
          :location          => 'http://debian.mirror.iweb.ca/debian/',
          :release           => 'sid',
          :repos             => 'testing',
          :key               => GPG_KEY_ID,
          :pin               => '10',
          :architecture      => 'x86_64',
          :allow_unsigned    => true,
        }
      end

      it { is_expected.to contain_apt__setting('list-my_source').with({
        :ensure => 'present',
      }).with_content(/# foo\ndeb \[arch=x86_64 trusted=yes\] http:\/\/debian\.mirror\.iweb\.ca\/debian\/ sid testing\n/).without_content(/deb-src/)
      }

      it { is_expected.to contain_apt__pin('my_source').that_comes_before('Apt::Setting[list-my_source]').with({
        :ensure   => 'present',
        :priority => '10',
        :origin   => 'debian.mirror.iweb.ca',
      })
      }

      it { is_expected.to contain_apt__key("Add key: #{GPG_KEY_ID} from Apt::Source my_source").that_comes_before('Apt::Setting[list-my_source]').with({
        :ensure  => 'present',
        :id      => GPG_KEY_ID,
      })
      }
    end

    context 'with complex key' do
      let :params do
        {
          :comment           => 'foo',
          :location          => 'http://debian.mirror.iweb.ca/debian/',
          :release           => 'sid',
          :repos             => 'testing',
          :key               => { 'id' => GPG_KEY_ID, 'server' => 'pgp.mit.edu',
                                  'content' => 'GPG key content',
                                  'source'  => 'http://apt.puppetlabs.com/pubkey.gpg',},
          :pin               => '10',
          :architecture      => 'x86_64',
          :allow_unsigned    => true,
        }
      end

      it { is_expected.to contain_apt__setting('list-my_source').with({
        :ensure => 'present',
      }).with_content(/# foo\ndeb \[arch=x86_64 trusted=yes\] http:\/\/debian\.mirror\.iweb\.ca\/debian\/ sid testing\n/).without_content(/deb-src/)
      }

      it { is_expected.to contain_apt__pin('my_source').that_comes_before('Apt::Setting[list-my_source]').with({
        :ensure   => 'present',
        :priority => '10',
        :origin   => 'debian.mirror.iweb.ca',
      })
      }

      it { is_expected.to contain_apt__key("Add key: #{GPG_KEY_ID} from Apt::Source my_source").that_comes_before('Apt::Setting[list-my_source]').with({
        :ensure  => 'present',
        :id      => GPG_KEY_ID,
        :server  => 'pgp.mit.edu',
        :content => 'GPG key content',
        :source  => 'http://apt.puppetlabs.com/pubkey.gpg',
      })
      }
    end

    context 'with simple key' do
      let :params do
        {
          :comment        => 'foo',
          :location       => 'http://debian.mirror.iweb.ca/debian/',
          :release        => 'sid',
          :repos          => 'testing',
          :key            => GPG_KEY_ID,
          :pin            => '10',
          :architecture   => 'x86_64',
          :allow_unsigned => true,
        }
      end

      it { is_expected.to contain_apt__setting('list-my_source').with({
        :ensure => 'present',
      }).with_content(/# foo\ndeb \[arch=x86_64 trusted=yes\] http:\/\/debian\.mirror\.iweb\.ca\/debian\/ sid testing\n/).without_content(/deb-src/)
      }

      it { is_expected.to contain_apt__pin('my_source').that_comes_before('Apt::Setting[list-my_source]').with({
        :ensure   => 'present',
        :priority => '10',
        :origin   => 'debian.mirror.iweb.ca',
      })
      }

      it { is_expected.to contain_apt__key("Add key: #{GPG_KEY_ID} from Apt::Source my_source").that_comes_before('Apt::Setting[list-my_source]').with({
        :ensure  => 'present',
        :id      => GPG_KEY_ID,
      })
      }
    end
  end

  context 'allow_unsigned true' do
    let :facts do
      {
        :lsbdistid       => 'Debian',
        :lsbdistcodename => 'wheezy',
        :osfamily        => 'Debian',
        :puppetversion   => Puppet.version,
      }
    end
    let :params do
      {
        :location       => 'hello.there',
        :allow_unsigned => true,
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with({
      :ensure => 'present',
    }).with_content(/# my_source\ndeb \[trusted=yes\] hello.there wheezy main\n/)
    }
  end

  context 'architecture equals x86_64' do
    let :facts do
      {
        :lsbdistid       => 'Debian',
        :lsbdistcodename => 'wheezy',
        :osfamily        => 'Debian',
        :puppetversion   => Puppet.version,
      }
    end
    let :params do
      {
        :location     => 'hello.there',
        :include      => {'deb' => false, 'src' => true,},
        :architecture => 'x86_64',
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with({
      :ensure => 'present',
    }).with_content(/# my_source\ndeb-src \[arch=x86_64\] hello.there wheezy main\n/)
    }
  end

  context 'include_src => true' do
    let :facts do
      {
        :lsbdistid       => 'Debian',
        :lsbdistcodename => 'wheezy',
        :osfamily        => 'Debian',
        :puppetversion   => Puppet.version,
      }
    end
    let :params do
      {
        :location    => 'hello.there',
        :include_src => true,
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with({
      :ensure => 'present',
    }).with_content(/# my_source\ndeb hello.there wheezy main\ndeb-src hello.there wheezy main\n/)
    }
  end

  context 'include_deb => false' do
    let :facts do
      {
        :lsbdistid       => 'debian',
        :lsbdistcodename => 'wheezy',
        :osfamily        => 'debian',
        :puppetversion   => Puppet.version,
      }
    end
    let :params do
      {
        :location    => 'hello.there',
        :include_deb => false,
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with({
      :ensure => 'present',
    }).without_content(/deb-src hello.there wheezy main\n/)
    }
    it { is_expected.to contain_apt__setting('list-my_source').without_content(/deb hello.there wheezy main\n/) }
  end

  context 'include_src => true and include_deb => false' do
    let :facts do
      {
        :lsbdistid       => 'debian',
        :lsbdistcodename => 'wheezy',
        :osfamily        => 'debian',
        :puppetversion   => Puppet.version,
      }
    end
    let :params do
      {
        :location    => 'hello.there',
        :include_deb => false,
        :include_src => true,
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with({
      :ensure => 'present',
    }).with_content(/deb-src hello.there wheezy main\n/)
    }
    it { is_expected.to contain_apt__setting('list-my_source').without_content(/deb hello.there wheezy main\n/) }
  end

  context 'include precedence' do
    let :facts do
      {
        :lsbdistid       => 'debian',
        :lsbdistcodename => 'wheezy',
        :osfamily        => 'debian',
        :puppetversion   => Puppet.version,
      }
    end
    let :params do
      {
        :location    => 'hello.there',
        :include_deb => true,
        :include_src => false,
        :include     => { 'deb' => false, 'src' => true },
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with({
      :ensure => 'present',
    }).with_content(/deb-src hello.there wheezy main\n/)
    }
    it { is_expected.to contain_apt__setting('list-my_source').without_content(/deb hello.there wheezy main\n/) }
  end

  context 'ensure => absent' do
    let :facts do
      {
        :lsbdistid       => 'Debian',
        :lsbdistcodename => 'wheezy',
        :osfamily        => 'Debian',
        :puppetversion   => Puppet.version,
      }
    end
    let :params do
      {
        :ensure => 'absent',
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with({
      :ensure => 'absent'
    })
    }
  end

  describe 'validation' do
    context 'no release' do
      let :facts do
        {
          :lsbdistid       => 'Debian',
          :osfamily        => 'Debian',
          :puppetversion   => Puppet.version,
        }
      end
      let(:params) { { :location => 'hello.there', } }

      it do
        expect {
          subject.call
        }.to raise_error(Puppet::Error, /lsbdistcodename fact not available: release parameter required/)
      end
    end

    context 'invalid pin' do
      let :facts do
        {
          :lsbdistid       => 'Debian',
          :lsbdistcodename => 'wheezy',
          :osfamily        => 'Debian',
          :puppetversion   => Puppet.version,
        }
      end
      let :params do
        {
          :location => 'hello.there',
          :pin      => true,
        }
      end

      it do
        expect {
          subject.call
        }.to raise_error(Puppet::Error, /invalid value for pin/)
      end
    end

    context "with notify_update = undef (default)" do
      let :facts do
        {
          :lsbdistid       => 'Debian',
          :lsbdistcodename => 'wheezy',
          :osfamily        => 'Debian',
          :puppetversion   => Puppet.version,
        }
      end
      let :params do
        {
          :location      => 'hello.there',
        }
      end
      it { is_expected.to contain_apt__setting("list-#{title}").with_notify_update(true) }
    end

    context "with notify_update = true" do
      let :facts do
        {
          :lsbdistid       => 'Debian',
          :lsbdistcodename => 'wheezy',
          :osfamily        => 'Debian',
          :puppetversion   => Puppet.version,
        }
      end
      let :params do
        {
          :location      => 'hello.there',
          :notify_update => true,
        }
      end
      it { is_expected.to contain_apt__setting("list-#{title}").with_notify_update(true) }
    end

    context "with notify_update = false" do
      let :facts do
        {
          :lsbdistid       => 'Debian',
          :lsbdistcodename => 'wheezy',
          :osfamily        => 'Debian',
          :puppetversion   => Puppet.version,
        }
      end
      let :params do
        {
          :location      => 'hello.there',
          :notify_update => false,
        }
      end
      it { is_expected.to contain_apt__setting("list-#{title}").with_notify_update(false) }
    end

  end
end
