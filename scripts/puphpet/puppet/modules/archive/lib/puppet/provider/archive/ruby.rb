begin
  require 'puppet_x/bodeco/archive'
  require 'puppet_x/bodeco/util'
rescue LoadError
  require 'pathname' # WORK_AROUND #14073 and #7788
  archive = Puppet::Module.find('archive', Puppet[:environment].to_s)
  raise(LoadError, "Unable to find archive module in modulepath #{Puppet[:basemodulepath] || Puppet[:modulepath]}") unless archive
  require File.join archive.path, 'lib/puppet_x/bodeco/archive'
  require File.join archive.path, 'lib/puppet_x/bodeco/util'
end

require 'securerandom'
require 'tempfile'

Puppet::Type.type(:archive).provide(:ruby) do
  optional_commands aws: 'aws'
  defaultfor feature: :microsoft_windows
  attr_reader :archive_checksum

  def exists?
    if extracted?
      if File.exist? archive_filepath
        checksum?
      else
        cleanup
        true
      end
    else
      checksum?
    end
  end

  def create
    transfer_download(archive_filepath) unless checksum?
    extract
    cleanup
  end

  def destroy
    FileUtils.rm_f(archive_filepath) if File.exist?(archive_filepath)
  end

  def archive_filepath
    resource[:path]
  end

  def tempfile_name
    if resource[:checksum] == 'none'
      "#{resource[:filename]}_#{SecureRandom.base64}"
    else
      "#{resource[:filename]}_#{resource[:checksum]}"
    end
  end

  def creates
    if resource[:extract] == :true
      extracted? ? resource[:creates] : 'archive not extracted'
    else
      resource[:creates]
    end
  end

  def creates=(_value)
    extract
  end

  def checksum
    resource[:checksum] || (resource[:checksum] = remote_checksum if resource[:checksum_url])
  end

  def remote_checksum
    PuppetX::Bodeco::Util.content(
      resource[:checksum_url],
      username: resource[:username],
      password: resource[:password],
      cookie: resource[:cookie],
      proxy_server: resource[:proxy_server],
      proxy_type: resource[:proxy_type],
      insecure: resource[:allow_insecure]
    )[%r{\b[\da-f]{32,128}\b}i]
  end

  # Private: See if local archive checksum matches.
  # returns boolean
  def checksum?(store_checksum = true)
    archive_exist = File.exist? archive_filepath
    if archive_exist && resource[:checksum_type] != :none
      archive = PuppetX::Bodeco::Archive.new(archive_filepath)
      archive_checksum = archive.checksum(resource[:checksum_type])
      @archive_checksum = archive_checksum if store_checksum
      checksum == archive_checksum
    else
      archive_exist
    end
  end

  def cleanup
    return unless extracted? && resource[:cleanup] == :true
    Puppet.debug("Cleanup archive #{archive_filepath}")
    destroy
  end

  def extract
    return unless resource[:extract] == :true
    raise(ArgumentError, 'missing archive extract_path') unless resource[:extract_path]
    PuppetX::Bodeco::Archive.new(archive_filepath).extract(
      resource[:extract_path],
      custom_command: resource[:extract_command],
      options: resource[:extract_flags],
      uid: resource[:user],
      gid: resource[:group]
    )
  end

  def extracted?
    resource[:creates] && File.exist?(resource[:creates])
  end

  def transfer_download(archive_filepath)
    tempfile = Tempfile.new(tempfile_name)
    temppath = tempfile.path
    tempfile.close!

    case resource[:source]
    when %r{^(http|ftp)}
      download(temppath)
    when %r{^file}
      uri = URI(resource[:source])
      FileUtils.copy(Puppet::Util.uri_to_path(uri), temppath)
    when %r{^s3}
      s3_download(temppath)
    when nil
      raise(Puppet::Error, 'Unable to fetch archive, the source parameter is nil.')
    else
      raise(Puppet::Error, "Source file: #{resource[:source]} does not exists.") unless File.exist?(resource[:source])
      FileUtils.copy(resource[:source], temppath)
    end

    # conditionally verify checksum:
    if resource[:checksum_verify] == :true && resource[:checksum_type] != :none
      archive = PuppetX::Bodeco::Archive.new(temppath)
      raise(Puppet::Error, 'Download file checksum mismatch') unless archive.checksum(resource[:checksum_type]) == checksum
    end

    FileUtils.mkdir_p(File.dirname(archive_filepath))
    FileUtils.mv(temppath, archive_filepath)
  end

  def download(filepath)
    PuppetX::Bodeco::Util.download(
      resource[:source],
      filepath,
      username: resource[:username],
      password: resource[:password],
      cookie: resource[:cookie],
      proxy_server: resource[:proxy_server],
      proxy_type: resource[:proxy_type],
      insecure: resource[:allow_insecure]
    )
  end

  def s3_download(path)
    params = [
      's3',
      'cp',
      resource[:source],
      path
    ]

    aws(params)
  end

  def optional_switch(value, option)
    if value
      option.map { |flags| flags % value }
    else
      []
    end
  end
end
