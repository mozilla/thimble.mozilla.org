test_name 'C3606 - shallow clone repo depth overflow 64bit integer'

# Globals
repo_name = 'testrepo_shallow_clone'

pending_test("The overflow can't be handled on some git versions")

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

  step 'shallow clone repo with puppet (bad input ignored, full clone checkedout)' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      source => "file://#{tmpdir}/testrepo.git",
      provider => git,
      depth => 18446744073709551616,
    }
    EOS

    apply_manifest_on(host, pp, :catch_failures => true)
    apply_manifest_on(host, pp, :catch_changes  => true)
  end

  step 'verify checkout is NOT shallow' do
    on(host, "ls #{tmpdir}/#{repo_name}/.git/") do |res|
      fail_test('shallow not found') if res.stdout.include? "shallow"
    end
  end

end
