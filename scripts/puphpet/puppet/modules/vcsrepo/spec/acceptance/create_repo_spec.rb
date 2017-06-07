require 'spec_helper_acceptance'

tmpdir = default.tmpdir('vcsrepo')

describe 'create a repo' do
  context 'without a source' do
    it 'creates a blank repo' do
      pp = <<-EOS
      vcsrepo { "#{tmpdir}/testrepo_blank_repo":
        ensure => present,
        provider => git,
      }
      EOS

      # Run it twice and test for idempotency
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end

    describe file("#{tmpdir}/testrepo_blank_repo/") do
      it 'should have zero files' do
        shell("ls -1 #{tmpdir}/testrepo_blank_repo | wc -l") do |r|
          expect(r.stdout).to match(/^0\n$/)
        end
      end
    end

    describe file("#{tmpdir}/testrepo_blank_repo/.git") do
      it { is_expected.to be_directory }
    end
  end

  context 'no source but revision provided' do
    it 'should not fail (MODULES-2125)' do
      pp = <<-EOS
      vcsrepo { "#{tmpdir}/testrepo_blank_with_revision_repo":
        ensure   => present,
        provider => git,
        revision => 'master'
      }
      EOS

      # Run it twice and test for idempotency
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end
  end

  context 'bare repo' do
    it 'creates a bare repo' do
      pp = <<-EOS
      vcsrepo { "#{tmpdir}/testrepo_bare_repo":
        ensure => bare,
        provider => git,
      }
      EOS

      # Run it twice and test for idempotency
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end

    describe file("#{tmpdir}/testrepo_bare_repo/config") do
      it { is_expected.to contain 'bare = true' }
    end

    describe file("#{tmpdir}/testrepo_bare_repo/.git") do
      it { is_expected.not_to be_directory }
    end
  end

  context 'bare repo with a revision' do
    it 'does not create a bare repo when a revision is defined' do
      pp = <<-EOS
      vcsrepo { "#{tmpdir}/testrepo_bare_repo_rev":
        ensure => bare,
        provider => git,
        revision => 'master',
      }
      EOS

      apply_manifest(pp, :expect_failures => true)
    end

    describe file("#{tmpdir}/testrepo_bare_repo_rev") do
      it { is_expected.not_to be_directory }
    end
  end
end
