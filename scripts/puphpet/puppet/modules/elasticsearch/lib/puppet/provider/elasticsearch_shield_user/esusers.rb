Puppet::Type.type(:elasticsearch_shield_user).provide(:esusers) do
  desc "Provider for Shield file (esusers) user resources."

  mk_resource_methods

  os = Facter.value('osfamily')
  if os == 'OpenBSD'
    @homedir = '/usr/local/elasticsearch'
  else
    @homedir = '/usr/share/elasticsearch'
  end

  commands :esusers => "#{@homedir}/bin/shield/esusers"
  commands :es => "#{@homedir}/bin/elasticsearch"

  def self.esusers_with_path args
    args = [args] unless args.is_a? Array
    esusers(["--default.path.conf=#{@homedir}"] + args)
  end

  def self.users
    begin
      output = esusers_with_path('list')
    rescue Puppet::ExecutionFailure => e
      debug("#users had an error: #{e.inspect}")
      return nil
    end

    debug("Raw `esusers list` output: #{output}")
    output.split("\n").select { |u|
      # Keep only expected "user : role1,role2" formatted lines
      u[/^[^:]+:\s+\S+$/]
    }.map { |u|
      # Break into ["user ", " role1,role2"]
      u.split(':').first.strip
    }.map do |user|
      {
        :name => user,
        :ensure => :present,
        :provider => :esusers,
      }
    end
  end

  def self.instances
    users.map do |user|
      new user
    end
  end

  def self.prefetch(resources)
    instances.each do |prov|
      if resource = resources[prov.name]
        resource.provider = prov
      end
    end
  end

  def initialize(value={})
    super(value)
    @property_flush = {}
  end

  def flush
    arguments = []

    case @property_flush[:ensure]
    when :absent
      arguments << 'userdel'
      arguments << resource[:name]
    else
      arguments << 'useradd'
      arguments << resource[:name]
      arguments << '-p' << resource[:password]
    end

    self.class.esusers_with_path(arguments)
    @property_hash = self.class.users.detect { |u| u[:name] == resource[:name] }
  end

  def create
    @property_flush[:ensure] = :present
  end

  def exists?
    @property_hash[:ensure] == :present
  end

  def destroy
    @property_flush[:ensure] = :absent
  end

  def passwd
    self.class.esusers_with_path([
      'passwd',
      resource[:name],
      '-p', resource[:password]
    ])
  end
end
