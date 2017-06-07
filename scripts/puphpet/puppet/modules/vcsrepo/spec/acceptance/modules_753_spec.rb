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

  context 'clone with single remote' do
    it 'clones from default remote' do
      pp = <<-EOS
      vcsrepo { "#{tmpdir}/vcsrepo":
          ensure   => present,
          provider => git,
          source   => "https://github.com/puppetlabs/puppetlabs-vcsrepo.git",
      }
      EOS

      apply_manifest(pp, :catch_failures => true)

    end

    it "git config output should contain the remote" do
      shell("/usr/bin/git config -l -f #{tmpdir}/vcsrepo/.git/config") do |r|
        expect(r.stdout).to match(/remote.origin.url=https:\/\/github.com\/puppetlabs\/puppetlabs-vcsrepo.git/)
      end
    end

    after(:all) do
      shell("rm -rf #{tmpdir}/vcsrepo")
    end

  end

  context 'clone with multiple remotes' do
    it 'clones from default remote and adds 2 remotes to config file' do
      pp = <<-EOS
      vcsrepo { "#{tmpdir}/vcsrepo":
          ensure   => present,
          provider => git,
          source   => {"origin" => "https://github.com/puppetlabs/puppetlabs-vcsrepo.git", "test1" => "https://github.com/puppetlabs/puppetlabs-vcsrepo.git"},
      }
      EOS

      apply_manifest(pp, :catch_failures => true)

    end

    it "git config output should contain the remotes" do
      shell("/usr/bin/git config -l -f #{tmpdir}/vcsrepo/.git/config") do |r|
        expect(r.stdout).to match(/remote.origin.url=https:\/\/github.com\/puppetlabs\/puppetlabs-vcsrepo.git/)
        expect(r.stdout).to match(/remote.test1.url=https:\/\/github.com\/puppetlabs\/puppetlabs-vcsrepo.git/)
      end
    end

    after(:all) do
      shell("rm -rf #{tmpdir}/vcsrepo")
    end

  end

end
