test_name 'C3480 - shallow clone repo minimal depth = 1 (https protocol)'
skip_test 'Not currently supported. See FM-1286'

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
    my_root = File.expand_path(File.join(File.dirname(__FILE__), '../../../..'))
    scp_to(host, "#{my_root}/acceptance/files/create_git_repo.sh", tmpdir)
    on(host, "cd #{tmpdir} && ./create_git_repo.sh")
  end
  step 'setup - start https server' do
    https_daemon =<<-EOF
    require 'webrick'
    require 'webrick/https'
    server = WEBrick::HTTPServer.new(
    :Port               => 8443,
    :DocumentRoot       => "#{tmpdir}",
    :SSLEnable          => true,
    :SSLVerifyClient    => OpenSSL::SSL::VERIFY_NONE,
    :SSLCertificate     => OpenSSL::X509::Certificate.new(  File.open("#{tmpdir}/server.crt").read),
    :SSLPrivateKey      => OpenSSL::PKey::RSA.new(          File.open("#{tmpdir}/server.key").read),
    :SSLCertName        => [ [ "CN",WEBrick::Utils::getservername ] ])
    WEBrick::Daemon.start
    server.start
    EOF
    create_remote_file(host, '/tmp/https_daemon.rb', https_daemon)
    #on(host, "#{ruby} /tmp/https_daemon.rb")
  end

  teardown do
    on(host, "rm -fr #{tmpdir}")
    on(host, 'ps ax | grep "#{ruby} /tmp/https_daemon.rb" | grep -v grep | awk \'{print "kill -9 " $1}\' | sh ; sleep 1')
  end

  step 'shallow clone repo with puppet' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      source => "https://github.com/johnduarte/testrepo.git",
      provider => git,
      depth => 1,
    }
    EOS

    apply_manifest_on(host, pp, :catch_failures => true)
    apply_manifest_on(host, pp, :catch_changes  => true)
  end

  step 'verify checkout is shallow and of the correct depth' do
    on(host, "ls #{tmpdir}/#{repo_name}/.git/") do |res|
      fail_test('shallow not found') unless res.stdout.include? "shallow"
    end

    on(host, "wc -l #{tmpdir}/#{repo_name}/.git/shallow") do |res|
      fail_test('shallow not found') unless res.stdout.include? "1 #{tmpdir}/#{repo_name}/.git/shallow"
    end
  end

end
