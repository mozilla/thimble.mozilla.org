test_name 'C3493 - checkout with basic auth (https protocol)'
skip_test 'waiting for CA trust solution'

# Globals
repo_name = 'testrepo_checkout'
user      = 'foo'
password  = 'bar'
http_server_script = 'basic_auth_https_daemon.rb'

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
    script =<<-EOF
    require 'webrick'
    require 'webrick/https'

    authenticate = Proc.new do |req, res|
      WEBrick::HTTPAuth.basic_auth(req, res, '') do |user, password|
        user == '#{user}' && password == '#{password}'
      end
    end

    server = WEBrick::HTTPServer.new(
    :Port               => 8443,
    :DocumentRoot       => "#{tmpdir}",
    :DocumentRootOptions=> {:HandlerCallback => authenticate},
    :SSLEnable          => true,
    :SSLVerifyClient    => OpenSSL::SSL::VERIFY_NONE,
    :SSLCertificate     => OpenSSL::X509::Certificate.new(  File.open("#{tmpdir}/server.crt").read),
    :SSLPrivateKey      => OpenSSL::PKey::RSA.new(          File.open("#{tmpdir}/server.key").read),
    :SSLCertName        => [ [ "CN",WEBrick::Utils::getservername ] ])
    WEBrick::Daemon.start
    server.start
    EOF
    create_remote_file(host, "#{tmpdir}/#{http_server_script}", script)
    on(host, "#{ruby} #{tmpdir}/#{http_server_script}")
  end

  teardown do
    on(host, "rm -fr #{tmpdir}")
    on(host, "ps ax | grep '#{ruby} #{tmpdir}/#{http_server_script}' | grep -v grep | awk '{print \"kill -9 \" $1}' | sh ; sleep 1")
  end

  step 'checkout with puppet using basic auth' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      source => "http://#{host}:8443/testrepo.git",
      provider => git,
      basic_auth_username => '#{user}',
      basic_auth_password => '#{password}',
    }
    EOS

    apply_manifest_on(host, pp, :catch_failures => true)
    apply_manifest_on(host, pp, :catch_changes  => true)
  end

  step "verify checkout" do
    on(host, "ls #{tmpdir}/#{repo_name}/.git/") do |res|
      fail_test('checkout not found') unless res.stdout.include? "HEAD"
    end
  end

end
