Puppet::Type.type(:sysctl).provide(:darwin) do

  confine  :kernel => 'darwin'
  commands :sysctl => 'sysctl'

  def exists?
    @property_hash[:ensure] == :present
  end

  def self.prefetch(host)
    instances.each do |prov|
      if pkg = host[prov.name]
        pkg.provider = prov
      end
    end
  end

  def self.instances
    sysctlconf=lines || []
    instances = []
    sysctloutput = sysctl('-a').split(/\r?\n/)
    sysctloutput.each do |line|
      #next if line =~ /dev.cdrom.info/

      if line =~ /^[\w]+(\.[\w\_]+)+: /

        kernelsetting = line.split(':')
        Puppet.debug kernelsetting

        confval = sysctlconf.grep(/^#{kernelsetting[0].strip}\s?=/)
        if confval.empty?
          value = kernelsetting[1].strip
          permanent = 'no'
        else
          permanent = 'yes'
          unless confval[0].split(/=/)[1].strip == kernelsetting[1].strip
            value = "outofsync(sysctl:#{kernelsetting[1].strip},config:#{confval[0].split(/=/)[1].strip})"
          else
            value = kernelsetting[1].strip
          end
        end
        instances << new(:ensure => :present, :name => kernelsetting[0].strip, :value => value, :permanent => permanent)
      end
    end
    instances
  end

  def destroy
    local_lines = lines
    File.open(@resource[:path],'w') do |fh|
      fh.write(local_lines.reject{|l| l =~ /^#{@resource[:name]}\s?\=\s?[\S+]/ }.join(''))
    end
    @lines = nil
  end

  def permanent
    @property_hash[:permanent]
  end

  def create
    sysctloutput = sysctl('-a').split(/\r?\n/)
    Puppet.debug "#{sysctloutput.grep(/^#{@resource[:name]}\s?=/)}"
    if sysctloutput.grep(/^#{@resource[:name]}\s?=/).empty?
      self.fail "Invalid sysctl parameter"
    end
  end

  def permanent=(ispermanent)
    if ispermanent == "yes"
      b = ( @resource[:value] == nil ? value : @resource[:value] )
      File.open(@resource[:path], 'a') do |fh|
        fh.puts "#{@resource[:name]} = #{b}"
      end
    else
      local_lines = lines
      File.open(@resource[:path],'w') do |fh|
        fh.write(local_lines.reject{|l| l =~ /^#{@resource[:name]}/ }.join(''))
      end
    end
    @lines = nil
    @property_hash[:permanent] = ispermanent
  end

  def value
    @property_hash[:value]
  end

  def value=(thesetting)
    sysctl('-w', "#{@resource[:name]}=#{thesetting}")
    b = ( @resource[:value] == nil ? value : @resource[:value] )
    if lines
      lines.find do |line|
        if line =~ /^#{@resource[:name]}/ && line !~ /^#{@resource[:name]}\s?=\s?#{b}$/
          content = File.read(@resource[:path])
          unless File.exists?(@resource[:path])

          end
          File.open(@resource[:path],'w') do |fh|
            # this regex is not perfect yet
            fh.write(content.gsub(/#{line}/,"#{@resource[:name]}\ =\ #{b}\n"))
          end
        end
      end
    else
      File.open(@resource[:path],'w') do |fh|
        # this regex is not perfect yet
        fh.puts "#{@resource[:name]} = #{b}"
      end
    end
    @lines = nil
    @property_hash[:value] = thesetting
  end

  def self.lines
    begin
      @lines ||= File.readlines('/etc/sysctl.conf')
    rescue Errno::ENOENT
      return nil
    end
  end
  def lines
    begin
      @lines ||= File.readlines(@resource[:path])
    rescue Errno::ENOENT
      return nil
    end
  end
end
