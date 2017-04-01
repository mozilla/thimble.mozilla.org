test_name 'C3439 - checkout a branch (ssh protocol, scp syntax)'

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
  step 'setup - establish ssh keys' do
    # create ssh keys
    on(host, 'yes | ssh-keygen -q -t rsa -f /root/.ssh/id_rsa -N ""')

    # copy public key to authorized_keys
    on(host, 'cat /root/.ssh/id_rsa.pub >> /root/.ssh/authorized_keys')
    on(host, 'echo -e "Host *\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config')
    on(host, 'chown -R root:root /root/.ssh')
  end

  teardown do
    on(host, "rm -fr #{tmpdir}")
    apply_manifest_on(host, "file{'/root/.ssh/id_rsa': ensure => absent, force => true }", :catch_failures => true)
    apply_manifest_on(host, "file{'/root/.ssh/id_rsa.pub': ensure => absent, force => true }", :catch_failures => true)
  end

  step 'checkout a branch with puppet' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      source => "root@#{host}:#{tmpdir}/testrepo.git",
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
