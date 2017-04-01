require 'spec_helper_acceptance'

tmpdir = default.tmpdir('vcsrepo')

describe 'MODULES-660' do
  before(:all) do
    # Create testrepo.git
    my_root = File.expand_path(File.join(File.dirname(__FILE__), '..'))
    shell("mkdir -p #{tmpdir}") # win test
    scp_to(default, "#{my_root}/acceptance/files/create_git_repo.sh", tmpdir)
    shell("cd #{tmpdir} && ./create_git_repo.sh")

    # Configure testrepo.git as upstream of testrepo
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/testrepo":
      ensure   => present,
      provider => git,
      revision => 'a_branch',
      source   => "file://#{tmpdir}/testrepo.git",
    }
    EOS
    apply_manifest(pp, :catch_failures => true)
  end

  after(:all) do
    shell("rm -rf #{tmpdir}/testrepo.git")
  end

  shared_examples 'switch to branch/tag/sha' do
    it 'pulls the new branch commits' do
      pp = <<-EOS
      vcsrepo { "#{tmpdir}/testrepo":
        ensure   => latest,
        provider => git,
        revision => 'a_branch',
        source   => "file://#{tmpdir}/testrepo.git",
      }
      EOS
      apply_manifest(pp, :expect_changes => true)
      apply_manifest(pp, :catch_changes  => true)
    end
    it 'checks out the tag' do
      pp = <<-EOS
      vcsrepo { "#{tmpdir}/testrepo":
        ensure   => latest,
        provider => git,
        revision => '0.0.3',
        source   => "file://#{tmpdir}/testrepo.git",
      }
      EOS
      apply_manifest(pp, :expect_changes => true)
      apply_manifest(pp, :catch_changes  => true)
    end
    it 'checks out the sha' do
      sha = shell("cd #{tmpdir}/testrepo && git rev-parse origin/master").stdout.chomp
      pp = <<-EOS
      vcsrepo { "#{tmpdir}/testrepo":
        ensure   => latest,
        provider => git,
        revision => '#{sha}',
        source   => "file://#{tmpdir}/testrepo.git",
      }
      EOS
      apply_manifest(pp, :expect_changes => true)
      apply_manifest(pp, :catch_changes  => true)
    end
  end

  context 'on branch' do
    before :each do
      shell("cd #{tmpdir}/testrepo && git checkout a_branch")
      shell("cd #{tmpdir}/testrepo && git reset --hard 0.0.2")
    end
    it_behaves_like 'switch to branch/tag/sha'
  end
  context 'on tag' do
    before :each do
      shell("cd #{tmpdir}/testrepo && git checkout 0.0.1")
    end
    it_behaves_like 'switch to branch/tag/sha'
  end
  context 'on detached head' do
    before :each do
      shell("cd #{tmpdir}/testrepo && git checkout 0.0.2")
      shell("cd #{tmpdir}/testrepo && git checkout HEAD~1")
    end
    it_behaves_like 'switch to branch/tag/sha'
  end
end
