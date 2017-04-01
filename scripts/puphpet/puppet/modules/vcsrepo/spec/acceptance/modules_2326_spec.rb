require 'spec_helper_acceptance'

tmpdir = default.tmpdir('vcsrepo')

describe 'clones with special characters' do

  before(:all) do
    my_root = File.expand_path(File.join(File.dirname(__FILE__), '..'))
    shell("mkdir -p #{tmpdir}") # win test
    scp_to(default, "#{my_root}/acceptance/files/create_git_repo.sh", tmpdir)
    shell("cd #{tmpdir} && ./create_git_repo.sh")
  end

  after(:all) do
    shell("rm -rf #{tmpdir}/testrepo.git")
  end

  context 'as a user with ssh' do
    before(:all) do
      # create user
      pp = <<-EOS
        group { 'testuser-ssh':
          ensure => present,
        }
        user { 'testuser-ssh':
          ensure     => present,
          groups     => 'testuser-ssh',
          managehome => true,
        }
      EOS
      apply_manifest(pp, :catch_failures => true)

      # create ssh keys
      shell('mkdir -p /home/testuser-ssh/.ssh')
      shell('echo -e \'y\n\'|ssh-keygen -q -t rsa -f /home/testuser-ssh/.ssh/id_rsa -N ""')

      # copy public key to authorized_keys
      shell('cat /home/testuser-ssh/.ssh/id_rsa.pub > /home/testuser-ssh/.ssh/authorized_keys')
      shell('echo -e "Host localhost\n\tStrictHostKeyChecking no\n" > /home/testuser-ssh/.ssh/config')
      shell('chown -R testuser-ssh:testuser-ssh /home/testuser-ssh/.ssh')
      shell("chown testuser-ssh:testuser-ssh #{tmpdir}")
    end

    it 'applies the manifest' do
      pp = <<-EOS
        vcsrepo { "#{tmpdir}/testrepo_user_ssh":
          ensure   => present,
          provider => git,
          source   => "git+ssh://testuser-ssh@localhost#{tmpdir}/testrepo.git",
          user     => 'testuser-ssh',
        }
      EOS

      # Run it twice and test for idempotency
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes => true)
    end

    after(:all) do
      pp = <<-EOS
        user { 'testuser-ssh':
          ensure     => absent,
          managehome => true,
        }
      EOS
      apply_manifest(pp, :catch_failures => true)
    end
  end
end
