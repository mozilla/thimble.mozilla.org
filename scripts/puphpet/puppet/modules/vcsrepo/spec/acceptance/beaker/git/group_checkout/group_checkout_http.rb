test_name 'C3490 - checkout as a group (http protocol)'

# Globals
repo_name = 'testrepo_group_checkout'
group = 'mygroup'

hosts.each do |host|
  ruby = (host.is_pe? && '/opt/puppet/bin/ruby') || 'ruby'
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

  step 'setup - create group' do
    apply_manifest_on(host, "group { '#{group}': ensure => present, }", :catch_failures => true)
  end

  teardown do
    on(host, "rm -fr #{tmpdir}")
    on(host, "ps ax | grep '#{ruby} /tmp/http_daemon.rb' | grep -v grep | awk '{print \"kill -9 \" $1}' | sh ; sleep 1")
    apply_manifest_on(host, "group { '#{group}': ensure => absent, }", :catch_failures => true)
  end

  step 'checkout a group with puppet' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      source => "http://#{host}:8000/testrepo.git",
      provider => git,
      group => '#{group}',
    }
    EOS

    apply_manifest_on(host, pp, :catch_failures => true)
    apply_manifest_on(host, pp, :catch_changes  => true)
  end

  step "verify git checkout is own by group #{group}" do
    on(host, "ls #{tmpdir}/#{repo_name}/.git/") do |res|
      fail_test('checkout not found') unless res.stdout.include? "HEAD"
    end

    on(host, "stat --format '%U:%G' #{tmpdir}/#{repo_name}/.git/HEAD") do |res|
      fail_test('checkout not owned by group') unless res.stdout.include? ":#{group}"
    end
  end

end
