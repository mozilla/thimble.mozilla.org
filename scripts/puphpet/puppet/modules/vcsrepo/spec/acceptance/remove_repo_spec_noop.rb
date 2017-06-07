require 'spec_helper_acceptance'

tmpdir = default.tmpdir('vcsrepo')

describe 'does not remove a repo if noop' do
  it 'creates a blank repo' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/testrepo_noop_deleted":
      ensure   => present,
      provider => git,
    }
    EOS
    apply_manifest(pp, :catch_failures => true)
  end

  it 'does not remove a repo if noop' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/testrepo_noop_deleted":
      ensure   => absent,
      provider => git,
      force    => true,
    }
    EOS

    apply_manifest(pp, :catch_failures => true, :noop => true, :verbose => false)
  end

  describe file("#{tmpdir}/testrepo_noop_deleted") do
    it { is_expected.to be_directory }
  end
end
