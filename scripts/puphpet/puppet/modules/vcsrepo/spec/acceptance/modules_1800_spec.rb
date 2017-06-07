require 'spec_helper_acceptance'

tmpdir = default.tmpdir('vcsrepo')

describe 'clones a remote repo' do
  before(:all) do
    my_root = File.expand_path(File.join(File.dirname(__FILE__), '..'))
    shell("mkdir -p #{tmpdir}") # win test
  end

  after(:all) do
    shell("rm -rf #{tmpdir}/vcsrepo")
  end

  context 'ensure latest with no revision' do
    it 'clones from default remote' do
      pp = <<-EOS
      vcsrepo { "#{tmpdir}/vcsrepo":
          ensure   => present,
          provider => git,
          source   => "https://github.com/puppetlabs/puppetlabs-vcsrepo.git",
      }
      EOS

      apply_manifest(pp, :catch_failures => true)
      shell("cd #{tmpdir}/vcsrepo; /usr/bin/git reset --hard HEAD~2")
    end

    it 'updates' do
      pp = <<-EOS
      vcsrepo { "#{tmpdir}/vcsrepo":
          ensure   => latest,
          provider => git,
          source   => "https://github.com/puppetlabs/puppetlabs-vcsrepo.git",
      }
      EOS

      apply_manifest(pp, :catch_failures => true)
    end
  end
end
