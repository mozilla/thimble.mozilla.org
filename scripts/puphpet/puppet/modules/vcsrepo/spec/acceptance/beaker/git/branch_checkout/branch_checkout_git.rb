test_name 'C3436 - checkout a branch (git protocol)'

# Globals
repo_name = 'testrepo_branch_checkout'
branch = 'a_branch'

hosts.each do |host|
  tmpdir = host.tmpdir('vcsrepo')
  step 'setup - create repo' do
    git_pkg = 'git'
    if host['platform'] =~ /ubuntu-10/
      git_pkg = 'git-core'
    end
    install_package(host, git_pkg)
    my_root = File.expand_path(File.join(File.dirname(__FILE__), '../../../..'))
    scp_to(host, "#{my_root}/acceptance/files/create_git_repo.sh", tmpdir)
    on(host, "cd #{tmpdir} && ./create_git_repo.sh")
  end
  step 'setup - start git daemon' do
    install_package(host, 'git-daemon') unless host['platform'] =~ /debian|ubuntu/
    on(host, "git daemon --base-path=#{tmpdir}  --export-all --reuseaddr --verbose --detach")
  end

  teardown do
    on(host, "rm -fr #{tmpdir}")
    on(host, 'pkill -9 git-daemon ; sleep 1')
  end

  step 'checkout a branch with puppet' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      source => "git://#{host}/testrepo.git",
      provider => git,
      revision => '#{branch}',
    }
    EOS

    apply_manifest_on(host, pp, :catch_failures => true)
    apply_manifest_on(host, pp, :catch_changes  => true)
  end

  step "verify checkout is on the #{branch} branch" do
    on(host, "ls #{tmpdir}/#{repo_name}/.git/") do |res|
      fail_test('checkout not found') unless res.stdout.include? "HEAD"
    end

    on(host, "cat #{tmpdir}/#{repo_name}/.git/HEAD") do |res|
      fail_test('branch not found') unless res.stdout.include? "ref: refs/heads/#{branch}"
    end
  end

end
