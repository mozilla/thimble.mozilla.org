require 'spec_helper'

describe 'nodejs::npm', :type => :define do
  let(:title) { 'nodejs::npm' }
  let(:facts) {{
    :nodejs_stable_version => 'v0.10.20'
  }}

  describe 'install npm package' do
    let (:params) {{
      :name      => 'yo-foo',
      :pkg_name  => 'yo',
      :directory => '/foo'
    }}

    it { should contain_exec('npm_install_yo_/foo') \
      .with_command('npm install  yo') \
      .with_unless("npm list -p -l | grep '/foo/node_modules/yo:yo'")
    }
  end

  describe 'uninstall npm package' do
    let (:params) {{
      :name      => 'foo-yo',
      :ensure    => 'absent',
      :pkg_name  => 'yo',
      :directory => '/foo'
    }}

    it { should contain_exec('npm_remove_yo_/foo') \
      .with_command('npm remove yo') \
      .with_onlyif("npm list -p -l | grep '/foo/node_modules/yo:yo'")
    }
  end

  describe 'install npm package with version' do
    let (:params) {{
      :name      => 'foo-yo',
      :version   => '1.4',
      :pkg_name  => 'yo',
      :directory => '/foo'
    }}

    it { should contain_exec('npm_install_yo_/foo') \
      .with_command('npm install  yo@1.4') \
      .with_unless("npm list -p -l | grep '/foo/node_modules/yo:yo@1.4'")
    }
  end

  describe 'home path for unix systems' do
    operating_systems = ['Debian', 'Ubuntu', 'RedHat', 'SLES', 'Fedora', 'CentOS']
    operating_systems.each do |os|
      let (:params) {{
        :name         => 'foo-yo',
        :exec_as_user => 'Ma27',
        :pkg_name  => 'yo',
        :directory => '/foo'
      }}
      let(:facts) {{
        :operatingsystem       => os,
        :nodejs_stable_version => 'v0.10.20'
      }}

      it { should contain_exec('npm_install_yo_/foo') \
        .with_command('npm install  yo') \
        .with_unless("npm list -p -l | grep '/foo/node_modules/yo:yo'") \
        .with_environment('HOME=/home/Ma27')
      }
    end
  end

  describe 'installation from a package.json file' do
    let (:params) {{
      :list        => true,
      :directory   => '/foo',
      :install_opt => '-x -z'
    }}

    it { should contain_exec('npm_install_dir_/foo') \
      .with_command('npm install -x -z')
    }
  end
end
