test_name 'C3479 - shallow clone repo minimal depth = 1 (http protocol)'

# Globals
repo_name = 'testrepo_shallow_clone'

hosts.each do |host|
  ruby = (host.is_pe? && '/opt/puppet/bin/ruby') || 'ruby'
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

  step 'setup - start http server' do
    http_daemon =<<-EOF
    require 'webrick'
    server = WEBrick::HTTPServer.new(:Port => 8000, :DocumentRoot => "#{tmpdir}")
    WEBrick::Daemon.start
    server.start
    EOF
    create_remote_file(host, '/tmp/http_daemon.rb', http_daemon)
    on(host, "#{ruby} /tmp/http_daemon.rb")
  end

  teardown do
    on(host, "rm -fr #{tmpdir}")
    on(host, 'ps ax | grep "#{ruby} /tmp/http_daemon.rb" | grep -v grep | awk \'{print "kill -9 " $1}\' | sh ; sleep 1')
  end

  step 'shallow clone repo with puppet' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      source => "http://#{host}:8000/testrepo.git",
      provider => git,
      depth => 1,
    }
    EOS

    apply_manifest_on(host, pp, :expect_failures => true)
  end

  step 'git does not support shallow clone via HTTP: verify checkout is NOT created' do
    on(host, "ls #{tmpdir}") do |res|
      fail_test('checkout found') if res.stdout.include? "#{repo_name}"
    end
  end

end
