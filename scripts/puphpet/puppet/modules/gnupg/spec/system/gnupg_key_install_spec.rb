require 'spec_helper_system'

describe 'gnupg_key install' do

  before :all do
    puppet_apply("class {'gnupg': } ") do |r|
      r.exit_code.should == 0
    end
  end

  it 'should install a public key from a HTTP URL address' do
    pp = <<-EOS.unindent
      gnupg_key { 'jenkins_key':
        ensure     => present,
        user       => 'root',
        key_source => 'http://pkg.jenkins-ci.org/debian/jenkins-ci.org.key',
        key_id     => 'D50582E6',
      }
    EOS

    puppet_apply(pp) do |r|
      r.exit_code.should == 2
      r.refresh
      r.exit_code.should == 0
    end

    # check that gnupg installed the key
    gpg("--list-keys D50582E6") do |r|
      r.stdout.should =~ /D50582E6/
      r.stderr.should == ''
      r.exit_code == 0
    end
  end

  it 'should install a public key from a HTTPS URL address' do
    pp = <<-EOS.unindent
      gnupg_key { 'newrelic_key':
        ensure     => present,
        user       => 'root',
        key_source => 'https://download.newrelic.com/548C16BF.gpg',
        key_id     => '548C16BF',
      }
    EOS

    puppet_apply(pp) do |r|
      r.exit_code.should == 2
      r.refresh
      r.exit_code.should == 0
    end

    # check that gnupg installed the key
    gpg("--list-keys 548C16BF") do |r|
      r.stdout.should =~ /548C16BF/
      r.stderr.should == ''
      r.exit_code == 0
    end
  end

  it 'should install a public key from a key server' do
    pp = <<-EOS.unindent
      gnupg_key { 'root_key_foo':
        ensure    => present,
        user      => 'root',
        key_server => 'hkp://pgp.mit.edu/',
        key_id     => '20BC0A86',
      }
    EOS

    puppet_apply(pp) do |r|
      r.exit_code.should == 2
      r.refresh
      r.exit_code.should == 0
    end

    # check that gnupg installed the key
    gpg("--list-keys 20BC0A86") do |r|
      r.stdout.should =~ /20BC0A86/
      r.stderr.should == ''
      r.exit_code == 0
    end
  end

  it 'should remove public key 20BC0A86' do
    pp = <<-EOS.unindent
      gnupg_key { 'bye_bye_key':
        ensure => absent,
        key_id => 20BC0A86,
        user   => root,
      }
    EOS

    puppet_apply(pp) do |r|
      r.exit_code.should == 2
      r.refresh
      r.exit_code.should == 0
    end
  end

  it 'should install public key from the puppet fileserver/module repository' do
    pp = <<-EOS.unindent
      gnupg_key {'add_key_by_remote_source':
        ensure     => present,
        key_id     => 20BC0A86,
        user       => root,
        key_source => "puppet:///modules/gnupg/random.key",
      }
    EOS

    puppet_apply(pp) do |r|
      r.exit_code.should == 2
      r.refresh
      r.exit_code.should == 0
    end

    # check that gnupg installed the key
    gpg("--list-keys 20BC0A86") do |r|
      r.stdout.should =~ /20BC0A86/
      r.stderr.should == ''
      r.exit_code == 0
    end
  end

  it 'should not install a public key, because local resource does not exists' do
    pp = <<-EOS.unindent
      gnupg_key { 'jenkins_key':
        ensure     => present,
        user       => 'root',
        key_source => '/santa/claus/does/not/exists/org/sorry/kids.key',
        key_id     => '40404040',
      }
    EOS

    puppet_apply(pp) do |r|
      r.exit_code.should == 4
    end
  end

  it 'should fail to install a public key, because there is no content at the supplied URL address' do
    pp = <<-EOS.unindent
      gnupg_key { 'jenkins_key':
        ensure     => present,
        user       => 'root',
        key_source => 'http://foo.com/key-not-there.key',
        key_id     => '40404040',
      }
    EOS

    puppet_apply(pp) do |r|
      r.exit_code.should == 4
    end
  end
end
