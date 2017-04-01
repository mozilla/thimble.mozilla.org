require 'spec_helper'

describe 'nodejs::install', :type => :define do
  let(:title) { 'nodejs::install' }
  let(:facts) {{
    :nodejs_stable_version => 'v0.10.20'
  }}

  describe 'with default parameters' do
    
    let(:params) {{ }}

    it { should contain_file('nodejs-install-dir') \
      .with_ensure('directory')
    }

    it { should contain_wget__fetch('nodejs-download-v0.10.20') \
      .with_source('http://nodejs.org/dist/v0.10.20/node-v0.10.20.tar.gz') \
      .with_destination('/usr/local/node/node-v0.10.20.tar.gz')
    }

    it { should contain_file('nodejs-check-tar-v0.10.20') \
      .with_ensure('file') \
      .with_path('/usr/local/node/node-v0.10.20.tar.gz')
    }

    it { should contain_exec('nodejs-unpack-v0.10.20') \
      .with_command('tar -xzvf node-v0.10.20.tar.gz -C /usr/local/node/node-v0.10.20 --strip-components=1') \
      .with_cwd('/usr/local/node') \
      .with_unless('test -f /usr/local/node/node-v0.10.20/bin/node')
    }

    it { should contain_file('/usr/local/node/node-v0.10.20') \
      .with_ensure('directory')
    }

    it { should contain_exec('nodejs-make-install-v0.10.20') \
      .with_command('./configure --prefix=/usr/local/node/node-v0.10.20 && make && make install') \
      .with_cwd('/usr/local/node/node-v0.10.20') \
      .with_unless('test -f /usr/local/node/node-v0.10.20/bin/node')
    }

    it { should contain_file('nodejs-symlink-bin-with-version-v0.10.20') \
      .with_ensure('link') \
      .with_path('/usr/local/bin/node-v0.10.20') \
      .with_target('/usr/local/node/node-v0.10.20/bin/node')
    }

    it { should_not contain_file('/usr/local/bin/node') }
    it { should_not contain_file('/usr/local/bin/npm') }

    it { should_not contain_wget__fetch('npm-download-v0.10.20') }
    it { should_not contain_exec('npm-install-v0.10.20') }
  end

  describe 'with specific version v0.10.19' do

    let(:params) {{
      :version => 'v0.10.19'
    }}

    it { should contain_file('nodejs-install-dir') \
      .with_ensure('directory')
    }

    it { should contain_wget__fetch('nodejs-download-v0.10.19') \
      .with_source('http://nodejs.org/dist/v0.10.19/node-v0.10.19.tar.gz') \
      .with_destination('/usr/local/node/node-v0.10.19.tar.gz')
    }

    it { should contain_file('nodejs-check-tar-v0.10.19') \
      .with_ensure('file') \
      .with_path('/usr/local/node/node-v0.10.19.tar.gz')
    }

    it { should contain_exec('nodejs-unpack-v0.10.19') \
      .with_command('tar -xzvf node-v0.10.19.tar.gz -C /usr/local/node/node-v0.10.19 --strip-components=1') \
      .with_cwd('/usr/local/node') \
      .with_unless('test -f /usr/local/node/node-v0.10.19/bin/node')
    }

    it { should contain_file('/usr/local/node/node-v0.10.19') \
      .with_ensure('directory')
    }

    it { should contain_exec('nodejs-make-install-v0.10.19') \
      .with_command('./configure --prefix=/usr/local/node/node-v0.10.19 && make && make install') \
      .with_cwd('/usr/local/node/node-v0.10.19') \
      .with_unless('test -f /usr/local/node/node-v0.10.19/bin/node')
    }

    it { should contain_file('nodejs-symlink-bin-with-version-v0.10.19') \
      .with_ensure('link') \
      .with_path('/usr/local/bin/node-v0.10.19') \
      .with_target('/usr/local/node/node-v0.10.19/bin/node')
    }

    it { should_not contain_file('/usr/local/bin/node') }
    it { should_not contain_file('/usr/local/bin/npm') }

    it { should_not contain_wget__fetch('npm-download-v0.10.19') }
    it { should_not contain_exec('npm-install-v0.10.19') }
  end

  describe 'with specific version v0.6.2' do

    let(:params) {{
      :version  => 'v0.6.2',
      :with_npm => true,
    }}

    it { should contain_file('/usr/local/node/node-v0.6.2') \
      .with_ensure('directory')
    }

    it { should contain_wget__fetch('npm-download-v0.6.2') \
      .with_source('https://npmjs.org/install.sh') \
      .with_destination('/usr/local/node/node-v0.6.2/install-npm.sh')
    }

    it { should contain_exec('npm-install-v0.6.2') \
      .with_command('sh install-npm.sh') \
      .with_path(['/usr/local/node/node-v0.6.2/bin', '/bin', '/usr/bin']) \
      .with_cwd('/usr/local/node/node-v0.6.2') \
      .with_environment(['clean=yes', 'npm_config_prefix=/usr/local/node/node-v0.6.2'])
    }

    it { should_not contain_file('/usr/local/bin/node') }
    it { should_not contain_file('/usr/local/bin/npm') }

  end


  describe 'with a given target_dir' do
    let(:params) {{
      :target_dir => '/bin'
    }}

    it { should contain_file('nodejs-symlink-bin-with-version-v0.10.20') \
      .with_ensure('link') \
      .with_path('/bin/node-v0.10.20') \
      .with_target('/usr/local/node/node-v0.10.20/bin/node')
    }
  end

  describe 'without NPM' do
    let(:params) {{
      :with_npm => false
    }}

    it { should_not contain_exec('npm-download-v0.10.20') }
    it { should_not contain_exec('npm-install-v0.10.20') }
  end

  describe 'with make_install = false' do
    let(:params) {{
      :make_install => false
    }}

    it { should_not contain_exec('nodejs-make-install-v0.10.20') }
  end

  describe 'on a RedHat based OS (osfamily = RedHat)' do
    let(:facts) {{
      :osfamily => 'RedHat'
    }}
    let(:params) {{
      :version => '0.10.20'
    }}

    it { should contain_package('gcc-c++').with( 
      :ensure => 'present'
    )} 
  end

  describe 'on a OpenSuse based OS (osfamily = Suse)' do
    let(:facts) {{
      :osfamily => 'Suse'
    }}
    let(:params) {{
      :version => '0.10.20'
    }}

    it { should contain_package('gcc-c++').with(
      :ensure => 'present'
    )}
  end

  describe 'on a Non-RedHat based OS (osfamily != RedHat)' do
    let(:facts) {{
        :osfamily => 'Debian'
    }}
    let(:params) {{
      :version => '0.10.20'
    }}

    it { should contain_package('g++').with(
      :ensure => 'present'
    )}
  end

  describe 'uninstall' do
    before(:each) do
      Puppet::Parser::Functions.newfunction(:node_default_instance_directory, :type => :rvalue) {
        |args| "#{args[0]}/node-v5.4.1"
      }
    end

    describe 'any instance' do
      let(:params) {{
        :version => 'v0.12',
        :ensure  => 'absent',
      }}

      it { should contain_file('/usr/local/node/node-v0.12') \
        .with(:ensure => 'absent', :force => true, :recurse => true) \
      }

      it { should contain_file('/usr/local/bin/node-v0.12') \
        .with_ensure('absent') \
      }
    end
  end
end
