# rubocop:disable RSpec/MultipleExpectations
require 'spec_helper'
require 'puppet'

describe Puppet::Type.type(:archive) do
  let(:resource) do
    Puppet::Type.type(:archive).new(
      path: '/tmp/example.zip',
      source: 'http://home.lan/example.zip'
    )
  end

  it 'resource defaults' do
    expect(resource[:path]).to eq '/tmp/example.zip'
    expect(resource[:name]).to eq '/tmp/example.zip'
    expect(resource[:filename]).to eq 'example.zip'
    expect(resource[:extract]).to eq :false
    expect(resource[:cleanup]).to eq :true
    expect(resource[:checksum_type]).to eq :none
    expect(resource[:digest_type]).to eq nil
    expect(resource[:checksum_verify]).to eq :true
    expect(resource[:extract_flags]).to eq :undef
    expect(resource[:allow_insecure]).to eq false
  end

  it 'verify resource[:path] is absolute filepath' do
    expect do
      resource[:path] = 'relative/file'
    end.to raise_error(Puppet::Error, %r{archive path must be absolute: })
  end

  describe 'on posix', if: Puppet.features.posix? do
    it 'verify resoource[:source] is valid source' do
      expect do
        resource[:source] = 'http://home.lan/example.zip'
        resource[:source] = 'https://home.lan/example.zip'
        resource[:source] = 'ftp://home.lan/example.zip'
        resource[:source] = 's3://home.lan/example.zip'
        resource[:source] = '/tmp/example.zip'
      end.not_to raise_error

      expect do
        resource[:source] = 'afp://home.lan/example.zip'
        resource[:source] = '\tmp'
        resource[:source] = 'D:/example.zip'
      end.to raise_error(Puppet::Error, %r{invalid source url: })
    end
  end

  describe 'on windows', if: Puppet.features.microsoft_windows? do
    it 'verify resoource[:source] is valid source' do
      expect do
        resource[:source] = 'D:/example.zip'
      end.not_to raise_error

      expect do
        resource[:source] = '/tmp/example.zip'
        resource[:source] = '\Z:'
      end.to raise_error(Puppet::Error, %r{invalid source url: })
    end
  end

  it 'verify resource[:checksum] is valid' do
    expect do
      resource[:checksum] = '557e2ebb67b35d1fddff18090b6bc26b'
    end.not_to raise_error

    expect do
      resource[:checksum] = '557e2ebb67b35d1fddff18090b6bc26557e2ebb67b35d1fddff18090b6bc26bb'
    end.not_to raise_error

    expect do
      resource[:checksum] = 'too_short'
    end.to raise_error(Puppet::Error, %r{Invalid value})

    expect do
      resource[:checksum] = '557e'
    end.to raise_error(Puppet::Error, %r{Invalid value})
  end

  it 'verify resource[:checksum_type] is valid' do
    expect do
      [:none, :md5, :sha1, :sha2, :sha256, :sha384, :sha512].each do |type|
        resource[:checksum_type] = type
      end
    end.not_to raise_error

    expect do
      resource[:checksum_type] = :crc32
    end.to raise_error(Puppet::Error, %r{Invalid value})
  end

  it 'verify resource[:allow_insecure] is valid' do
    expect do
      [:true, :false, :yes, :no].each do |type|
        resource[:allow_insecure] = type
      end
    end.not_to raise_error
  end

  describe 'autorequire parent path' do
    let(:file_tmp) { Puppet::Type.type(:file).new(name: '/tmp') }
    let(:catalog) { Puppet::Resource::Catalog.new }

    it 'requires archive parent' do
      catalog.add_resource file_tmp
      example_archive = described_class.new(
        path: '/tmp/example.zip',
        source: 'http://home.lan/example.zip'
      )
      catalog.add_resource example_archive

      req = example_archive.autorequire
      expect(req.size).to be 1
      expect(req[0].target).to eql example_archive
      expect(req[0].source).to eql file_tmp
    end
  end
end
