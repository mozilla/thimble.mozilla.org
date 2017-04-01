require 'spec_helper'

describe 'apt::source', :type => :define do
  GPG_KEY_ID = '47B320EB4C7C375AA9DAE1A01054B7A24BD6EC30'

  let :title do
    'my_source'
  end

  context 'mostly defaults' do
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
        'include_deb' => false,
        'include_src' => true,
        'location'    => 'http://debian.mirror.iweb.ca/debian/',
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with_content(/# my_source\ndeb-src http:\/\/debian\.mirror\.iweb\.ca\/debian\/ wheezy main\n/)
    }
  end

  context 'no defaults' do
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
        'comment'           => 'foo',
        'location'          => 'http://debian.mirror.iweb.ca/debian/',
        'release'           => 'sid',
        'repos'             => 'testing',
        'include_src'       => false,
        'required_packages' => 'vim',
        'key'               => GPG_KEY_ID,
        'key_server'        => 'pgp.mit.edu',
        'key_content'       => 'GPG key content',
        'key_source'        => 'http://apt.puppetlabs.com/pubkey.gpg',
        'pin'               => '10',
        'architecture'      => 'x86_64',
        'trusted_source'    => true,
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with_content(/# foo\ndeb \[arch=x86_64 trusted=yes\] http:\/\/debian\.mirror\.iweb\.ca\/debian\/ sid testing\n/).without_content(/deb-src/)
    }

    it { is_expected.to contain_apt__pin('my_source').that_comes_before('Apt::Setting[list-my_source]').with({
      'ensure'   => 'present',
      'priority' => '10',
      'origin'   => 'debian.mirror.iweb.ca',
    })
    }

    it { is_expected.to contain_exec("Required packages: 'vim' for my_source").that_comes_before('Apt::Setting[list-my_source]').with({
      'command'     => '/usr/bin/apt-get -y install vim',
      'logoutput'   => 'on_failure',
      'refreshonly' => true,
      'tries'       => '3',
      'try_sleep'   => '1',
    })
    }

    it { is_expected.to contain_apt__key("Add key: #{GPG_KEY_ID} from Apt::Source my_source").that_comes_before('Apt::Setting[list-my_source]').with({
      'ensure' => 'present',
      'id'  => GPG_KEY_ID,
      'key_server' => 'pgp.mit.edu',
      'key_content' => 'GPG key content',
      'key_source' => 'http://apt.puppetlabs.com/pubkey.gpg',
    })
    }
  end

  context 'trusted_source true' do
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
        'include_src'    => false,
        'location'       => 'http://debian.mirror.iweb.ca/debian/',
        'trusted_source' => true,
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with_content(/# my_source\ndeb \[trusted=yes\] http:\/\/debian\.mirror\.iweb\.ca\/debian\/ wheezy main\n/) }
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
        'location'     => 'http://debian.mirror.iweb.ca/debian/',
        'architecture' => 'x86_64',
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with_content(/# my_source\ndeb \[arch=x86_64\] http:\/\/debian\.mirror\.iweb\.ca\/debian\/ wheezy main\n/)
    }
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
        'ensure' => 'absent',
      }
    end

    it { is_expected.to contain_apt__setting('list-my_source').with({
      'ensure' => 'absent'
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

      it do
        expect { subject.call }.to raise_error(Puppet::Error, /lsbdistcodename fact not available: release parameter required/)
      end
    end
  end
end
