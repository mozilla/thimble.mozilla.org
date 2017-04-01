test_name 'C3492 - checkout with basic auth (http protocol)'
skip_test 'HTTP not supported yet for basic auth using git. See FM-1331'

# Globals
repo_name = 'testrepo_checkout'
user      = 'foo'
password  = 'bar'
http_server_script = 'basic_auth_http_daemon.rb'

hosts.each do |host|
  ruby = '/opt/puppet/bin/ruby' if host.is_pe? || 'ruby'
  gem = '/opt/puppet/bin/gem' if host.is_pe? || 'gem'
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
    script =<<-EOF
    require 'sinatra'

    set :bind, '0.0.0.0'
    set :static, true
    set :public_folder, '#{tmpdir}'


    use Rack::Auth::Basic do |username, password|
        username == '#{user}' && password == '#{password}'
    end
    EOF
    create_remote_file(host, "#{tmpdir}/#{http_server_script}", script)
    on(host, "#{gem} install sinatra")
    on(host, "#{ruby} #{tmpdir}/#{http_server_script} &")
  end

  teardown do
    on(host, "rm -fr #{tmpdir}")
    on(host, "ps ax | grep '#{ruby} #{tmpdir}/#{http_server_script}' | grep -v grep | awk '{print \"kill -9 \" $1}' | sh ; sleep 1")
  end

  step 'checkout with puppet using basic auth' do
    pp = <<-EOS
    vcsrepo { "#{tmpdir}/#{repo_name}":
      ensure => present,
      source => "http://#{host}:4567/testrepo.git",
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
