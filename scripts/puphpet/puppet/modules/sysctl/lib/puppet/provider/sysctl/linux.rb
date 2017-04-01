Puppet::Type.type(:sysctl).provide(:linux) do

  confine  :kernel => 'linux'

  begin
    # This code contributed by Tom Doran to fix the stdout/err stream merging
    # problem where Puppet doesn't allow the command helper to specify 
    # or allow handling of stderr from commands with biggish output
    # Wrapped in a BeginRescueEnd because puppet 2.x

    class CommandDefinerNoMerge < Puppet::Provider::CommandDefiner
      def command
        @confiner.confine :exists => @path, :for_binary => true
        Puppet::Provider::Command.new(@name, @path, Puppet::Util, Puppet::Util::Execution, { :failonfail => true, :combine => false, :custom_environment => @custom_environment })
      end
    end
 
    def self.has_nomerge_command(name, path, &block)
      name = name.intern
      command = CommandDefinerNoMerge.define(name, path, self, &block)
  
      @commands[name] = command.executable
  
      create_class_and_instance_method(name) do |*args|
        return command.execute(*args)
      end
    end

    has_nomerge_command(:sysctl, 'sysctl') do
    end
  rescue
    commands :sysctl => 'sysctl'
  end

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
      if line =~ /=/
        kernelsetting = line.split('=')
        setting_name = kernelsetting[0].strip
        setting_value = kernelsetting[1].gsub(/\s+/,' ').strip
        confval = sysctlconf.grep(/^#{setting_name}\s?=/)
        if confval.empty?
          value = setting_value
          permanent = :false
        else
          permanent = :true
          unless confval[0].split(/=/)[1].gsub(/\s+/,' ').strip == setting_value
            value = "outofsync(sysctl:#{setting_value},config:#{confval[0].split(/=/)[1].strip})"
          else
            value = setting_value
          end
        end
        instances << new(:ensure => :present, :name => setting_name, :value => value, :permanent => permanent)
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
    if ispermanent == :true
      b = ( @resource[:value] == nil ? value : @resource[:value] )
      currentcontents=File.read(@resource[:path])
      cr = currentcontents =~ /\n\Z/ ? '' : "\n"
      File.open(@resource[:path], 'a') do |fh|
        fh.puts "#{cr}#{@resource[:name]} = #{b}"
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
