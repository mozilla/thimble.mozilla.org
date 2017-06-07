require 'spec_helper'

describe 'git::subtree' do

  versions = ['1.6.0', '1.7.0', '1.7.11']
  versions.each do |version|
    context "when git version is #{version}" do
    let(:facts) { {
      :git_version   => version,
     } }
      if version < '1.7.0'
        it 'should fail' do
          expect { should create_class('git::subtree') }.to raise_error(Puppet::Error, /git-subtree requires git 1.7 or later!/)
        end
      else
        it { should create_class('git::subtree') }
        it { should contain_class('git') }
        it { should contain_package('asciidoc') }
        it { should contain_package('xmlto') }
        it { should contain_exec('Install git-subtree') }
        it { should contain_exec('Build git-subtree') }

        it { should create_file('/etc/bash_completion.d/git-subtree').with({
          :ensure => 'file',
          :source => 'puppet:///modules/git/subtree/bash_completion.sh',
          :mode   => '0644',
        })}
      end
    end
  end

  context 'when git version > 1.7.0 and < 1.7.11' do
    let(:facts) { {
      :git_version   => '1.7.0',
      :git_exec_path => '/usr/lib/git-core',
      :git_html_path => "/usr/share/doc/git"
    } }

    it { should create_vcsrepo('/usr/src/git-subtree').with({
      :ensure   => 'present',
      :source   => 'https://github.com/apenwarr/git-subtree.git',
      :provider => 'git',
      :revision => '2793ee6ba',
    })}

    it { should create_exec('Build git-subtree').with({
      :command => 'make prefix=/usr libexecdir=/usr/lib/git-core',
      :creates => '/usr/src/git-subtree/git-subtree',
      :cwd     => '/usr/src/git-subtree',
    })}

    it { should create_exec('Install git-subtree').with({
      :command => 'make prefix=/usr libexecdir=/usr/lib/git-core install',
      :cwd     => '/usr/src/git-subtree',
    })}
  end

  context 'when git version >= 1.7.11' do
    let(:facts) { {
      :git_version   => '1.7.11',
      :git_exec_path => '/usr/lib/git-core',
      :git_html_path => "/usr/share/doc/git"
    } }

    it { should create_exec('Build git-subtree').with({
      :creates => '/usr/share/doc/git/contrib/subtree/git-subtree',
      :cwd     => '/usr/share/doc/git/contrib/subtree',
    })}

    it { should create_exec('Install git-subtree').with({
      :command => 'make prefix=/usr libexecdir=/usr/lib/git-core install',
      :cwd     => '/usr/share/doc/git/contrib/subtree',
    })}
  end


end
