# rubocop:disable RSpec/MultipleExpectations
require 'spec_helper'
require 'puppet_x/bodeco/archive'

describe PuppetX::Bodeco::Archive do
  let(:zipfile) do
    File.expand_path(File.join(File.dirname(__FILE__), '..', '..', '..', '..', 'files', 'test.zip'))
  end

  it '#checksum' do
    Dir.mktmpdir do |dir|
      tempfile = File.join(dir, 'test.zip')
      FileUtils.cp(zipfile, tempfile)

      archive = described_class.new(tempfile)
      expect(archive.checksum(:none)).to be nil
      expect(archive.checksum(:md5)).to eq '557e2ebb67b35d1fddff18090b6bc26b'
      expect(archive.checksum(:sha1)).to eq '377ec712d7fdb7266221db3441e3af2055448ead'
    end
  end

  it '#parse_flags' do
    archive = described_class.new('test.tar.gz')
    expect(archive.send(:parse_flags, 'xf', :undef, 'tar')).to eq 'xf'
    expect(archive.send(:parse_flags, 'xf', 'xvf', 'tar')).to eq 'xvf'
    expect(archive.send(:parse_flags, 'xf', { 'tar' => 'xzf', '7z' => '-y x' }, 'tar')).to eq 'xzf'
  end

  it '#command on RedHat' do
    Facter.stubs(:value).with(:osfamily).returns 'RedHat'

    tar = described_class.new('test.tar.gz')
    expect(tar.send(:command, :undef)).to eq 'tar xzf test.tar.gz'
    expect(tar.send(:command, 'xvf')).to eq 'tar xvf test.tar.gz'
    tar = described_class.new('test.tar.bz2')
    expect(tar.send(:command, :undef)).to eq 'tar xjf test.tar.bz2'
    expect(tar.send(:command, 'xjf')).to eq 'tar xjf test.tar.bz2'
    tar = described_class.new('test.tar.xz')
    expect(tar.send(:command, :undef)).to eq 'unxz -dc test.tar.xz | tar xf -'
    gunzip = described_class.new('test.gz')
    expect(gunzip.send(:command, :undef)).to eq 'gunzip -d test.gz'
    zip = described_class.new('test.zip')
    expect(zip.send(:command, :undef)).to eq 'unzip -o test.zip'
    expect(zip.send(:command, '-a')).to eq 'unzip -a test.zip'

    zip = described_class.new('/tmp/fun folder/test.zip')
    expect(zip.send(:command, :undef)).to eq 'unzip -o /tmp/fun\ folder/test.zip'
    expect(zip.send(:command, '-a')).to eq 'unzip -a /tmp/fun\ folder/test.zip'
  end

  system_v = %w(Solaris AIX)
  system_v.each do |os|
    it "#command on #{os}" do
      Facter.stubs(:value).with(:osfamily).returns os

      tar = described_class.new('test.tar.gz')
      expect(tar.send(:command, :undef)).to eq 'gunzip -dc test.tar.gz | tar xf -'
      expect(tar.send(:command, 'gunzip' => '-dc', 'tar' => 'xvf')).to eq 'gunzip -dc test.tar.gz | tar xvf -'
      tar = described_class.new('test.tar.bz2')
      expect(tar.send(:command, :undef)).to eq 'bunzip2 -dc test.tar.bz2 | tar xf -'
      expect(tar.send(:command, 'bunzip' => '-dc', 'tar' => 'xvf')).to eq 'bunzip2 -dc test.tar.bz2 | tar xvf -'
      tar = described_class.new('test.tar.xz')
      expect(tar.send(:command, :undef)).to eq 'unxz -dc test.tar.xz | tar xf -'
      gunzip = described_class.new('test.gz')
      expect(gunzip.send(:command, :undef)).to eq 'gunzip -d test.gz'
      zip = described_class.new('test.zip')
      expect(zip.send(:command, :undef)).to eq 'unzip -o test.zip'
      expect(zip.send(:command, '-a')).to eq 'unzip -a test.zip'

      zip = described_class.new('/tmp/fun folder/test.zip')
      expect(zip.send(:command, :undef)).to eq 'unzip -o /tmp/fun\ folder/test.zip'
      expect(zip.send(:command, '-a')).to eq 'unzip -a /tmp/fun\ folder/test.zip'
    end
  end

  it '#command on Windows' do
    Facter.stubs(:value).with(:osfamily).returns 'windows'

    tar = described_class.new('test.tar.gz')
    tar.stubs(:win_7zip).returns('7z.exe')
    expect(tar.send(:command, :undef)).to eq '7z.exe x -aoa test.tar.gz'
    expect(tar.send(:command, 'x -aot')).to eq '7z.exe x -aot test.tar.gz'

    zip = described_class.new('test.zip')
    zip.stubs(:win_7zip).returns('7z.exe')
    expect(zip.send(:command, :undef)).to eq '7z.exe x -aoa test.zip'

    zip = described_class.new('C:/Program Files/test.zip')
    zip.stubs(:win_7zip).returns('7z.exe')
    expect(zip.send(:command, :undef)).to eq '7z.exe x -aoa C:/Program\ Files/test.zip'
  end
end
