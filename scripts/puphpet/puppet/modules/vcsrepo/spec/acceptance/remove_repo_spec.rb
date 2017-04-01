require 'spec_helper_acceptance'

tmpdir = default.tmpdir('vcsrepo')

describe 'remove a repo' do
  it 'creates a blank repo' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/testrepo_deleted":
      ensure => present,
      provider => git,
    }
    EOS
    apply_manifest(pp, :catch_failures => true)
  end

  it 'removes a repo' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/testrepo_deleted":
      ensure => absent,
      provider => git,
    }
    EOS

    apply_manifest(pp, :catch_failures => true)
  end

  describe file("#{tmpdir}/testrepo_deleted") do
    it { is_expected.not_to be_directory }
  end
end
