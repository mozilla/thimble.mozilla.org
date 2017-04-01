test_name 'C3483 - checkout as a user that is not on system'

# Globals
repo_name = 'testrepo_user_checkout'
user = 'myuser'

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

  step 'setup - delete user' do
    apply_manifest_on(host, "user { '#{user}': ensure => absent, }", :catch_failures => true)
  end

  teardown do
    on(host, "rm -fr #{tmpdir}")
  end

  step 'checkout as a user with puppet' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      source => "file://#{tmpdir}/testrepo.git",
      provider => git,
      owner => '#{user}',
    }
    EOS

    apply_manifest_on(host, pp, :expect_failures => true)
  end

  step "verify git checkout is NOT owned by user #{user}" do
    on(host, "ls #{tmpdir}/#{repo_name}/.git/") do |res|
      fail_test('checkout not found') unless res.stdout.include? "HEAD"
    end

    on(host, "stat --format '%U:%G' #{tmpdir}/#{repo_name}/.git/HEAD") do |res|
      fail_test('checkout not owned by user') if res.stdout.include? "#{user}:"
    end
  end

end
