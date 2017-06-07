test_name 'C3509 - clone repo with excludes not in repo'
skip_test 'expectations not defined'

# Globals
repo_name = 'testrepo_with_excludes_not_in_repo'
exclude1 = "`exec \"rm -rf /tmp\"`"

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

  step 'clone repo with excludes not in repo with puppet' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      source => "file://#{tmpdir}/testrepo.git",
      provider => git,
      excludes => [ '#{exclude1}' ],
    }
    EOS

    apply_manifest_on(host, pp, :catch_failures => true)
    apply_manifest_on(host, pp, :catch_changes  => true)
  end

  step 'verify excludes are known to git' do
    on(host, "cat #{tmpdir}/#{repo_name}/.git/info/exclude") do |res|
      fail_test('exclude not found') unless res.stdout.include? "#{exclude1}"
    end
  end

end
