require 'spec_helper_acceptance'

describe 'mysql_user' do
  describe 'setup' do
    it 'should work with no errors' do
      pp = <<-EOS
        class { 'mysql::server': }
      EOS

      apply_manifest(pp, :catch_failures => true)
    end
  end

  context 'using ashp@localhost' do
    describe 'adding user' do
      it 'should work without errors' do
        pp = <<-EOS
          mysql_user { 'ashp@localhost':
            password_hash => '*F9A8E96790775D196D12F53BCC88B8048FF62ED5',
          }
        EOS

        apply_manifest(pp, :catch_failures => true)
      end

      it 'should find the user' do
        shell("mysql -NBe \"select '1' from mysql.user where CONCAT(user, '@', host) = 'ashp@localhost'\"") do |r|
          expect(r.stdout).to match(/^1$/)
          expect(r.stderr).to be_empty
        end
      end
      it 'has no SSL options' do
        shell("mysql -NBe \"select SSL_TYPE from mysql.user where CONCAT(user, '@', host) = 'ashp@localhost'\"") do |r|
          expect(r.stdout).to match(/^\s*$/)
          expect(r.stderr).to be_empty
        end
      end
    end
  end

  context 'using ashp-dash@localhost' do
    describe 'adding user' do
      it 'should work without errors' do
        pp = <<-EOS
          mysql_user { 'ashp-dash@localhost':
            password_hash => '*F9A8E96790775D196D12F53BCC88B8048FF62ED5',
          }
        EOS

        apply_manifest(pp, :catch_failures => true)
      end

      it 'should find the user' do
        shell("mysql -NBe \"select '1' from mysql.user where CONCAT(user, '@', host) = 'ashp-dash@localhost'\"") do |r|
          expect(r.stdout).to match(/^1$/)
          expect(r.stderr).to be_empty
        end
      end
    end
  end

  context 'using ashp@LocalHost' do
    describe 'adding user' do
      it 'should work without errors' do
        pp = <<-EOS
          mysql_user { 'ashp@LocalHost':
            password_hash => '*F9A8E96790775D196D12F53BCC88B8048FF62ED5',
          }
        EOS

        apply_manifest(pp, :catch_failures => true)
      end

      it 'should find the user' do
        shell("mysql -NBe \"select '1' from mysql.user where CONCAT(user, '@', host) = 'ashp@localhost'\"") do |r|
          expect(r.stdout).to match(/^1$/)
          expect(r.stderr).to be_empty
        end
      end
    end
  end
  context 'using resource should throw no errors' do
    describe 'find users' do
      it {
        on default, puppet('resource mysql_user'), {:catch_failures => true} do |r|
          expect(r.stdout).to_not match(/Error:/)
          expect(r.stdout).to_not match(/must be properly quoted, invalid character:/)
        end
      }
    end
  end
  context 'using user-w-ssl@localhost with SSL' do
    describe 'adding user' do
      it 'should work without errors' do
        pp = <<-EOS
          mysql_user { 'user-w-ssl@localhost':
            password_hash => '*F9A8E96790775D196D12F53BCC88B8048FF62ED5',
            tls_options   => ['SSL'],
          }
        EOS

        apply_manifest(pp, :catch_failures => true)
      end

      it 'should find the user' do
        shell("mysql -NBe \"select '1' from mysql.user where CONCAT(user, '@', host) = 'user-w-ssl@localhost'\"") do |r|
          expect(r.stdout).to match(/^1$/)
          expect(r.stderr).to be_empty
        end
      end
      it 'should show correct ssl_type' do
        shell("mysql -NBe \"select SSL_TYPE from mysql.user where CONCAT(user, '@', host) = 'user-w-ssl@localhost'\"") do |r|
          expect(r.stdout).to match(/^ANY$/)
          expect(r.stderr).to be_empty
        end
      end
    end
  end
  context 'using user-w-x509@localhost with X509' do
    describe 'adding user' do
      it 'should work without errors' do
        pp = <<-EOS
          mysql_user { 'user-w-x509@localhost':
            password_hash => '*F9A8E96790775D196D12F53BCC88B8048FF62ED5',
            tls_options   => ['X509'],
          }
        EOS

        apply_manifest(pp, :catch_failures => true)
      end

      it 'should find the user' do
        shell("mysql -NBe \"select '1' from mysql.user where CONCAT(user, '@', host) = 'user-w-x509@localhost'\"") do |r|
          expect(r.stdout).to match(/^1$/)
          expect(r.stderr).to be_empty
        end
      end
      it 'should show correct ssl_type' do
        shell("mysql -NBe \"select SSL_TYPE from mysql.user where CONCAT(user, '@', host) = 'user-w-x509@localhost'\"") do |r|
          expect(r.stdout).to match(/^X509$/)
          expect(r.stderr).to be_empty
        end
      end
    end
  end
end
