require 'spec_helper_acceptance'

describe 'git::config class' do

  context 'with some user settings' do
    it 'should work idempotently with no errors' do
      pp = <<-EOS
      package { 'git': }
      ->
      git::config { 'Root User Email':
        key   => 'user.email',
        value => 'john.doe@example.com',
      }
      ->
      user { 'janedoe':
        ensure      => 'present',
        managehome  => true,
      }
      ->
      file { '/home/janedoe/.gitconfig':
        ensure   => 'present',
      }
      ->
      git::config { 'Jane User Email':
        key   => 'user.email',
        user  => 'janedoe',
        value => 'jane.doe@example.com',
      }
      EOS

      # Run it twice and test for idempotency
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes  => true)
    end

    describe file('/home/janedoe/.gitconfig') do
      its(:content) { should match /email = jane.doe@example.com/ }
    end

    describe file('/root/.gitconfig') do
      its(:content) { should match /email = john.doe@example.com/ }
    end
  end
end
