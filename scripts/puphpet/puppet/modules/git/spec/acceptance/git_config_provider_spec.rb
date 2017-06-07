require 'spec_helper_acceptance'

describe 'git::config class' do

  context 'with some user settings' do
    it 'should work idempotently with no errors' do
      pp = <<-EOS
      package { 'git': }
      ->
      git::config { 'user.name':
        value => 'John Doe',
      }
      ->
      git::config { 'user.email':
        value => 'john.doe@example.com',
      }
      EOS

      # Run it twice and test for idempotency
      apply_manifest(pp, :catch_failures => true)
      apply_manifest(pp, :catch_changes  => true)
    end

    describe file('/root/.gitconfig') do
      its(:content) { should match /email = john.doe@example.com/ }
      its(:content) { should match /name = John Doe/ }
    end
  end
end
