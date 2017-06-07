require 'spec_helper_acceptance'

PUPPETLABS_GPG_KEY_SHORT_ID    = '4BD6EC30'
PUPPETLABS_GPG_KEY_LONG_ID     = '1054B7A24BD6EC30'
PUPPETLABS_GPG_KEY_FINGERPRINT = '47B320EB4C7C375AA9DAE1A01054B7A24BD6EC30'
PUPPETLABS_APT_URL             = 'apt.puppetlabs.com'
PUPPETLABS_GPG_KEY_FILE        = 'pubkey.gpg'
CENTOS_GPG_KEY_SHORT_ID        = 'C105B9DE'
CENTOS_GPG_KEY_LONG_ID         = '0946FCA2C105B9DE'
CENTOS_GPG_KEY_FINGERPRINT     = 'C1DAC52D1664E8A4386DBA430946FCA2C105B9DE'
CENTOS_REPO_URL                = 'ftp.cvut.cz/centos'
CENTOS_GPG_KEY_FILE            = 'RPM-GPG-KEY-CentOS-6'

SHOULD_NEVER_EXIST_ID          = '4BD6EC30'

KEY_CHECK_COMMAND              = "apt-key adv --list-keys --with-colons --fingerprint | grep "
PUPPETLABS_KEY_CHECK_COMMAND   = "#{KEY_CHECK_COMMAND} #{PUPPETLABS_GPG_KEY_FINGERPRINT}"
CENTOS_KEY_CHECK_COMMAND       = "#{KEY_CHECK_COMMAND} #{CENTOS_GPG_KEY_FINGERPRINT}"

describe 'apt_key' do
  before(:each) do
    # Delete twice to make sure everything is cleaned
    # up after the short key collision
    shell("apt-key del #{PUPPETLABS_GPG_KEY_SHORT_ID}",
          :acceptable_exit_codes => [0,1,2])
    shell("apt-key del #{PUPPETLABS_GPG_KEY_SHORT_ID}",
          :acceptable_exit_codes => [0,1,2])
  end

  describe 'default options' do
    key_versions = {
      '32bit key id'                        => '4BD6EC30',
      '64bit key id'                        => '1054B7A24BD6EC30',
      '160bit key fingerprint'              => '47B320EB4C7C375AA9DAE1A01054B7A24BD6EC30',
      '32bit lowercase key id'              => '4bd6ec30',
      '64bit lowercase key id'              => '1054b7a24bd6ec30',
      '160bit lowercase key fingerprint'    => '47b320eb4c7c375aa9dae1a01054b7a24bd6ec30',
      '0x formatted 32bit key id'           => '0x4BD6EC30',
      '0x formatted 64bit key id'           => '0x1054B7A24BD6EC30',
      '0x formatted 160bit key fingerprint' => '0x47B320EB4C7C375AA9DAE1A01054B7A24BD6EC30',
      '0x formatted 32bit lowercase key id' => '0x4bd6ec30',
      '0x formatted 64bit lowercase key id' => '0x1054b7a24bd6ec30',
      '0x formatted 160bit lowercase key fingerprint' => '0x47b320eb4c7c375aa9dae1a01054b7a24bd6ec30',
    }

    key_versions.each do |key, value|
      context "#{key}" do
        it 'works' do
          pp = <<-EOS
          apt_key { 'puppetlabs':
            id     => '#{value}',
            ensure => 'present',
          }
          EOS

          apply_manifest(pp, :catch_failures => true)
          apply_manifest(pp, :catch_changes => true)
          shell(PUPPETLABS_KEY_CHECK_COMMAND)
        end
      end
    end

    context 'invalid length key id' do
      it 'fails' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id => '4B7A24BD6EC30',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/Valid values match/)
        end
      end
    end
  end

  describe 'ensure =>' do
    context 'absent' do
      it 'is removed' do
        pp = <<-EOS
        apt_key { 'centos':
          id     => '#{CENTOS_GPG_KEY_LONG_ID}',
          ensure => 'absent',
        }
        EOS

        # Install the key first
        shell("apt-key adv --keyserver hkps.pool.sks-keyservers.net \
              --recv-keys #{CENTOS_GPG_KEY_FINGERPRINT}")
        shell(CENTOS_KEY_CHECK_COMMAND)

        # Time to remove it using Puppet
        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)

        shell(CENTOS_KEY_CHECK_COMMAND,
              :acceptable_exit_codes => [1])

        shell("apt-key adv --keyserver hkps.pool.sks-keyservers.net \
              --recv-keys #{CENTOS_GPG_KEY_FINGERPRINT}")
      end
    end

    context 'absent, added with long key', :unless => (fact('operatingsystem') == 'Debian' and fact('operatingsystemmajrelease') == '6') do
      it 'is removed' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure => 'absent',
        }
        EOS

        # Install the key first
        shell("apt-key adv --keyserver hkps.pool.sks-keyservers.net \
              --recv-keys #{PUPPETLABS_GPG_KEY_LONG_ID}")
        shell(PUPPETLABS_KEY_CHECK_COMMAND)

        # Time to remove it using Puppet
        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)

        shell(PUPPETLABS_KEY_CHECK_COMMAND,
              :acceptable_exit_codes => [1])
      end
    end
  end

  describe 'content =>' do
    context 'puppetlabs gpg key' do
      it 'works' do
        pp = <<-EOS
          apt_key { 'puppetlabs':
            id      => '#{PUPPETLABS_GPG_KEY_FINGERPRINT}',
            ensure  => 'present',
            content => "-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: GnuPG v1.4.12 (GNU/Linux)
Comment: GPGTools - http://gpgtools.org

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
=a34C
-----END PGP PUBLIC KEY BLOCK-----",
          }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)
        shell(PUPPETLABS_KEY_CHECK_COMMAND)
      end
    end

    context 'multiple keys' do
      it 'runs without errors' do
        pp = <<-EOS
          apt_key { 'puppetlabs':
            id      => '#{PUPPETLABS_GPG_KEY_FINGERPRINT}',
            ensure  => 'present',
            content => "-----BEGIN PGP PUBLIC KEY BLOCK-----
Version: GnuPG v1.4.12 (GNU/Linux)
Comment: GPGTools - http://gpgtools.org

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
=Gl+v
-----END PGP PUBLIC KEY BLOCK-----",
          }
        EOS
        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)
        shell(PUPPETLABS_KEY_CHECK_COMMAND)
      end
    end

    context 'bogus key' do
      it 'fails' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id      => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure  => 'present',
          content => 'For posterity: such content, much bogus, wow',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/no valid OpenPGP data found/)
        end
      end
    end
  end

  describe 'server =>' do
    context 'hkps.pool.sks-keyservers.net' do
      it 'works' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure => 'present',
          server => 'hkps.pool.sks-keyservers.net',
        }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)
        shell(PUPPETLABS_KEY_CHECK_COMMAND)
      end
    end

    context 'hkp://hkps.pool.sks-keyservers.net:80' do
      it 'works' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_FINGERPRINT}',
          ensure => 'present',
          server => 'hkp://hkps.pool.sks-keyservers.net:80',
        }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)
        shell(PUPPETLABS_KEY_CHECK_COMMAND)
      end
    end

    context 'nonexistant.key.server' do
      it 'fails' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure => 'present',
          server => 'nonexistant.key.server',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/(Host not found|Couldn't resolve host)/)
        end
      end
    end

    context 'key server start with dot' do
      it 'fails' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure => 'present',
          server => '.pgp.key.server',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/Invalid value \".pgp.key.server\"/)
        end
      end
    end
  end

  describe 'source =>' do
    context 'http://' do
      it 'works' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure => 'present',
          source => 'http://#{PUPPETLABS_APT_URL}/#{PUPPETLABS_GPG_KEY_FILE}',
        }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)
        shell(PUPPETLABS_KEY_CHECK_COMMAND)
      end

      it 'fails with a 404' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure => 'present',
          source => 'http://#{PUPPETLABS_APT_URL}/herpderp.gpg',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/404 Not Found/)
        end
      end

      it 'fails with a socket error' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure => 'present',
          source => 'http://apt.puppetlabss.com/herpderp.gpg',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/could not resolve/)
        end
      end
    end

    context 'ftp://' do
      before(:each) do
        shell("apt-key del #{CENTOS_GPG_KEY_LONG_ID}",
              :acceptable_exit_codes => [0,1,2])
      end

      it 'works' do
        pp = <<-EOS
        apt_key { 'CentOS 6':
          id     => '#{CENTOS_GPG_KEY_LONG_ID}',
          ensure => 'present',
          source => 'ftp://#{CENTOS_REPO_URL}/#{CENTOS_GPG_KEY_FILE}',
        }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)
        shell(CENTOS_KEY_CHECK_COMMAND)
      end

      it 'fails with a 550' do
        pp = <<-EOS
        apt_key { 'CentOS 6':
          id     => '#{SHOULD_NEVER_EXIST_ID}',
          ensure => 'present',
          source => 'ftp://#{CENTOS_REPO_URL}/herpderp.gpg',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/550 Failed to open/)
        end
      end

      it 'fails with a socket error' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure => 'present',
          source => 'ftp://apt.puppetlabss.com/herpderp.gpg',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/could not resolve/)
        end
      end
    end

    context 'https://' do
      it 'works' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure => 'present',
          source => 'https://#{PUPPETLABS_APT_URL}/#{PUPPETLABS_GPG_KEY_FILE}',
        }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)
        shell(PUPPETLABS_KEY_CHECK_COMMAND)
      end

      it 'fails with a 404' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{SHOULD_NEVER_EXIST_ID}',
          ensure => 'present',
          source => 'https://#{PUPPETLABS_APT_URL}/herpderp.gpg',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/404 Not Found/)
        end
      end

      it 'fails with a socket error' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{SHOULD_NEVER_EXIST_ID}',
          ensure => 'present',
          source => 'https://apt.puppetlabss.com/herpderp.gpg',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/could not resolve/)
        end
      end
    end

    context '/path/that/exists' do
      before(:each) do
        shell("curl -o /tmp/puppetlabs-pubkey.gpg \
              http://#{PUPPETLABS_APT_URL}/#{PUPPETLABS_GPG_KEY_FILE}")
      end

      after(:each) do
        shell('rm /tmp/puppetlabs-pubkey.gpg')
      end

      it 'works' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '4BD6EC30',
          ensure => 'present',
          source => '/tmp/puppetlabs-pubkey.gpg',
        }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)
        shell(PUPPETLABS_KEY_CHECK_COMMAND)
      end
    end

    context '/path/that/does/not/exist' do
      it 'fails' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure => 'present',
          source => '/tmp/totally_bogus.file',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/does not exist/)
        end
      end
    end

    context '/path/that/exists/with/bogus/content' do
      before(:each) do
        shell('echo "here be dragons" > /tmp/fake-key.gpg')
      end

      after(:each) do
        shell('rm /tmp/fake-key.gpg')
      end
      it 'fails' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id     => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure => 'present',
          source => '/tmp/fake-key.gpg',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/no valid OpenPGP data found/)
        end
      end
    end
  end

  describe 'options =>' do
    context 'debug' do
      it 'works' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id      => '#{PUPPETLABS_GPG_KEY_LONG_ID}',
          ensure  => 'present',
          options => 'debug',
        }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)
        shell(PUPPETLABS_KEY_CHECK_COMMAND)
      end
    end
  end

  describe 'fingerprint validation against source/content' do
    context 'fingerprint in id matches fingerprint from remote key' do
      it 'works' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id      => '#{PUPPETLABS_GPG_KEY_FINGERPRINT}',
          ensure  => 'present',
          source  => 'https://#{PUPPETLABS_APT_URL}/#{PUPPETLABS_GPG_KEY_FILE}',
        }
        EOS

        apply_manifest(pp, :catch_failures => true)
        apply_manifest(pp, :catch_failures => true)
      end
    end

    context 'fingerprint in id does NOT match fingerprint from remote key' do
      it 'works' do
        pp = <<-EOS
        apt_key { 'puppetlabs':
          id      => '47B320EB4C7C375AA9DAE1A01054B7A24BD6E666',
          ensure  => 'present',
          source  => 'https://#{PUPPETLABS_APT_URL}/#{PUPPETLABS_GPG_KEY_FILE}',
        }
        EOS

        apply_manifest(pp, :expect_failures => true) do |r|
          expect(r.stderr).to match(/do not match/)
        end
      end
    end
  end

end
