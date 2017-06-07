test_name 'C3470 - create repo that already exists'

# Globals
repo_name = 'testrepo_already_exists'

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
    on(host, "cd #{tmpdir} && git clone file://#{tmpdir}/testrepo.git #{repo_name}")
  end

  teardown do
    on(host, "rm -fr #{tmpdir}")
  end

  step 'create repo that already exists using puppet' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      provider => git,
    }
    EOS

    apply_manifest_on(host, pp, :catch_failures => true)
    apply_manifest_on(host, pp, :catch_changes  => true)
  end

  step 'verify repo is on master branch' do
    on(host, "cat #{tmpdir}/#{repo_name}/.git/HEAD") do |res|
      assert_match(/ref: refs\/heads\/master/, stdout, "Git checkout not on master on #{host}")
    end
  end

end
