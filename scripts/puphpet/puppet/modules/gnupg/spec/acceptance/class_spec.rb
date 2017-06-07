require 'spec_helper_acceptance'

describe 'gnupg class', :unless => UNSUPPORTED_PLATFORMS.include?(fact('osfamily')) do
  case fact('osfamily')
  when 'RedHat'
    package_name = 'gnupg2'
  when 'Debian'
    package_name = 'gnupg'
  end

  context 'default parameters' do
    it 'should work with no errors' do
      pp = <<-EOS
      class { 'gnupg': }
      EOS

      # Run it twice and test for idempotency
      apply_manifest(pp, :catch_failures => true)
      expect(apply_manifest(pp, :catch_failures => true).exit_code).to be_zero
    end

    describe package(package_name) do
      it { is_expected.to be_installed }
    end

  end

end