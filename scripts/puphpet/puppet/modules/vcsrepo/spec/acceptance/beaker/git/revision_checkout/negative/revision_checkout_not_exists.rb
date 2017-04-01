test_name 'C3614 - checkout a revision that does not exist'

# Globals
repo_name = 'testrepo_revision_checkout'

hosts.each do |host|
  tmpdir = host.tmpdir('vcsrepo')
  step 'setup - create repo' do
    git_pkg = 'git'
    if host['platform'] =~ /ubuntu-10/
      git_pkg = 'git-core'
    end
    install_package(host, git_pkg)
    my_root = File.expand_path(File.join(File.dirname(__FILE__), '../../../../..'))
    scp_to(host, "#{my_root}/acceptance/files/create_git_repo.sh", tmpdir)
    on(host, "cd #{tmpdir} && ./create_git_repo.sh")
  end

  teardown do
    on(host, "rm -fr #{tmpdir}")
  end

  step 'checkout revision that does not exist with puppet' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      source => "file://#{tmpdir}/testrepo.git",
      provider => git,
      revision => '11111111111111111',
    }
    EOS

    apply_manifest_on(host, pp, :expect_failures => true)
  end

  step 'verify that master revision is checked out' do
    on(host, "ls #{tmpdir}/#{repo_name}/.git/") do |res|
      fail_test('checkout not found') unless res.stdout.include? "HEAD"
    end

    on(host, "cat #{tmpdir}/#{repo_name}/.git/HEAD") do |res|
      fail_test('revision not found') unless res.stdout.include? "ref: refs/heads/master"
    end
  end

end
