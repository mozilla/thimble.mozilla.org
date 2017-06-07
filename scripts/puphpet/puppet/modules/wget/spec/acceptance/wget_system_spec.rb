require 'spec_helper_acceptance'

describe 'wget' do

  let(:wget_manifest) { "class { 'wget': }" }
  let(:manifest) { wget_manifest }

  before do
    shell "rm -f /tmp/index*"
  end

  context 'when running as root' do
    let(:manifest) { super() + %Q(
        wget::fetch { "download Google's index":
          source      => 'http://www.google.com/index.html',
          destination => '/tmp/index.html',
          timeout     => 0,
          verbose     => false,
        }
      )
    }

    it 'should be idempotent' do
      apply_manifest(manifest, :catch_failures => true)
      apply_manifest(manifest, :catch_changes => true)
      shell('test -e /tmp/index.html')
    end
  end

  context 'when running as user' do
    before do
      apply_manifest(wget_manifest, :catch_failures => true)
    end

    let(:manifest) { %Q(
      wget::fetch { 'download Google index':
        source      => 'http://www.google.com/index.html',
        destination => '/tmp/index-vagrant.html',
        timeout     => 0,
        verbose     => false,
      }
    ) }

    it "should succeed" do
      shell("cat << EOF | su - vagrant -c 'puppet apply --verbose --detailed-exitcodes --modulepath=/etc/puppet/modules'\n#{manifest}", :acceptable_exit_codes => [2]) do |r|
        expect(r.stdout).to match(%r{Wget::Fetch\[download Google index\].*returns: executed successfully})
      end
      shell('test -e /tmp/index-vagrant.html')
    end
  end

  context 'when running with source_hash' do
    before do
      apply_manifest(wget_manifest, :catch_failures => true)
    end

    # the source_hash for the example.net index page might change over time

    let(:manifest) { %Q(
      wget::fetch { 'download RFC 2606':
        source      => 'https://tools.ietf.org/rfc/rfc2606.txt',
        source_hash => 'c24c7a3118bafb5d7111f9ed5f73264b',
        destination => '/tmp/rfc-2606.txt',
        timeout     => 0,
        verbose     => false,
      }
    ) }

    it "should succeed" do
      shell("cat << EOF | su - vagrant -c 'puppet apply --verbose --detailed-exitcodes --modulepath=/etc/puppet/modules'\n#{manifest}", :acceptable_exit_codes => [2]) do |r|
        expect(r.stdout).to match(%r{Wget::Fetch\[download RFC 2606\].*returns: executed successfully})
      end
      shell('test -e /tmp/rfc-2606.txt')
    end
  end

  context 'when running with invalid source_hash' do
    before do
      apply_manifest(wget_manifest, :catch_failures => true)
    end

    let(:manifest) { %Q(
      wget::fetch { 'download RFC 2606':
        source      => 'https://tools.ietf.org/rfc/rfc2606.txt',
        source_hash => '00000000000000000000000000000000',
        destination => '/tmp/rfc-2606-failed.txt',
        timeout     => 0,
        verbose     => false,
      }
    ) }

    it "should fail" do
      shell("cat << EOF | su - vagrant -c 'puppet apply --verbose --detailed-exitcodes --modulepath=/etc/puppet/modules'\n#{manifest}", :acceptable_exit_codes => [6]) do |r|
        expect(r.stdout).to match(%r{Wget::Fetch\[download RFC 2606\].*returns: md5sum: WARNING: 1 .*computed checksum did NOT match})
        expect(r.stdout).to match(%r{Wget::Fetch\[download RFC 2606\].*returns: /tmp/rfc-2606-failed.txt: FAILED})
      end
      shell('test ! -e /tmp/rfc-2606-failed')
    end
  end
end
