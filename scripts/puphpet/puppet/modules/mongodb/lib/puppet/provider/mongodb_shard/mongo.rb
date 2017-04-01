require File.expand_path(File.join(File.dirname(__FILE__), '..', 'mongodb'))
Puppet::Type.type(:mongodb_shard).provide(:mongo, :parent => Puppet::Provider::Mongodb ) do

  desc "Manage mongodb sharding."

  confine :true =>
    begin
      require 'json'
      true
    rescue LoadError
      false
    end

  mk_resource_methods

  commands :mongo => 'mongo'

  def initialize(value={})
    super(value)
    @property_flush = {}
  end

  def destroy
    @property_flush[:ensure] = :absent
  end

  def create
    @property_flush[:ensure] = :present
    @property_flush[:member] = resource.should(:member)
    @property_flush[:keys]   = resource.should(:keys)
  end

  def sh_addshard member
    return mongo_command("sh.addShard(\"#{member}\")", '127.0.0.1:27017')
  end

  def sh_shardcollection shard_key
    collection = shard_key.keys.first
    keys = shard_key.values.first.collect do |key, value|
      "\"#{key}\": #{value.to_s}"
    end

    return mongo_command("sh.shardCollection(\"#{collection}\", {#{keys.join(',')}})", '127.0.0.1:27017')
  end

  def sh_enablesharding member
    return mongo_command("sh.enableSharding(\"#{member}\")", '127.0.0.1:27017')
  end

  def self.prefetch(resources)
    instances.each do |prov|
      if resource = resources[prov.name]
        resource.provider = prov
      end
    end
  end

  def flush
    set_member
    @property_hash = self.class.get_shard_properties(resource[:name])
  end

  def set_member
    if @property_flush[:ensure] == :absent
      # a shard can't be removed easily at this time
      return
    end

    if @property_flush[:ensure] == :present and @property_hash[:ensure] != :present
      Puppet.debug "Adding the shard #{self.name}"
      output = sh_addshard(@property_flush[:member])
      if output['ok'] == 0
        raise Puppet::Error, "sh.addShard() failed for shard #{self.name}: #{output['errmsg']}"
      end
      output = sh_enablesharding(self.name)
      if output['ok'] == 0
        raise Puppet::Error, "sh.enableSharding() failed for shard #{self.name}: #{output['errmsg']}"
       end
      if @property_flush[:keys]
        @property_flush[:keys].each do |key|
          output = sh_shardcollection(key)
          if output['ok'] == 0
            raise Puppet::Error, "sh.shardCollection() failed for shard #{self.name}: #{output['errmsg']}"
          end
         end
      end
    end
  end


  def self.instances
    instances = get_shards_properties.collect do |shard|
      new (shard)
    end
  end

  def self.get_shard_collection_details obj, shard_name
    collection_array = []
    obj.each do |database|
      if database['_id'].eql? shard_name and ! database['shards'].nil?
        collection_array = database['shards'].collect do |collection|
          { collection.keys.first => collection.values.first['shardkey']}
        end
      end
    end
    collection_array
  end

  def self.get_shard_properties shard
    properties = {}
    output = mongo_command('sh.status()')
    output['shards'].each do |s|
      if s['_id'] == shard
        properties = {
          :name     => s['_id'],
          :ensure   => :present,
          :member   => s['host'],
          :keys     =>  get_shard_collection_details(output['databases'], s['_id']),
          :provider => :mongo,
        }
      end 
    end
    properties
  end

  def self.get_shards_properties
    output = mongo_command('sh.status()')
    if output['shards'].size > 0
      properties = output['shards'].collect do |shard|
        {
          :name     => shard['_id'],
          :ensure   => :present,
          :member   => shard['host'],
          :keys     =>  get_shard_collection_details(output['databases'], shard['_id']),
          :provider => :mongo,
        }
      end
    else
      properties = []
    end
    Puppet.debug("MongoDB shard properties: #{properties.inspect}")
    properties
  end

  def exists?
    @property_hash[:ensure] == :present
  end

  def mongo_command(command, host, retries=4)
    self.class.mongo_command(command,host,retries)
  end

  def self.mongo_command(command, host=nil, retries=4)
    # Allow waiting for mongod to become ready
    # Wait for 2 seconds initially and double the delay at each retry
    wait = 2
    begin
      args = Array.new
      args << '--quiet'
      args << ['--host',host] if host
      args << ['--eval',"printjson(#{command})"]
      output = mongo(args.flatten)
    rescue Puppet::ExecutionFailure => e
      if e =~ /Error: couldn't connect to server/ and wait <= 2**max_wait
        info("Waiting #{wait} seconds for mongod to become available")
        sleep wait
        wait *= 2
        retry
      else
        raise
      end
    end

    # NOTE (spredzy) : sh.status()
    # does not return a json stream
    # we jsonify it so it is easier
    # to parse and deal with it
    if command == 'sh.status()'
      myarr = output.split("\n")
      myarr.shift
      myarr.pop
      myarr.pop
      final_stream = []
      prev_line = nil
      in_shard_list = 0
      in_chunk = 0
      myarr.each do |line|
        line.gsub!(/sharding version:/, '{ "sharding version":')
        line.gsub!(/shards:/, ',"shards":[')
        line.gsub!(/databases:/, '], "databases":[')
        line.gsub!(/"clusterId" : ObjectId\("(.*)"\)/, '"clusterId" : "ObjectId(\'\1\')"')
        line.gsub!(/\{  "_id" :/, ",{  \"_id\" :") if /_id/ =~ prev_line
        # Modification for shard
        line = '' if line =~ /on :.*Timestamp/
        if line =~ /_id/ and in_shard_list == 1
          in_shard_list = 0
          last_line = final_stream.pop.strip
          proper_line = "#{last_line}]},"
          final_stream << proper_line
        end
        if line =~ /shard key/ and in_shard_list == 1
          shard_name = final_stream.pop.strip
          proper_line = ",{\"#{shard_name}\":"
          final_stream << proper_line
        end
        if line =~ /shard key/ and in_shard_list == 0
          in_shard_list = 1
          shard_name = final_stream.pop.strip
          id_line = "#{final_stream.pop[0..-2]}, \"shards\": "
          proper_line = "[{\"#{shard_name}\":"
          final_stream << id_line
          final_stream << proper_line
        end
        if in_chunk == 1
          in_chunk = 0
          line = "\"#{line.strip}\"}}"
        end
        if line =~ /chunks/ and in_chunk == 0
          in_chunk = 1
        end
        line.gsub!(/shard key/, '{"shard key"')
        line.gsub!(/chunks/, ',"chunks"')
        final_stream << line if line.size > 0
        prev_line = line
      end
      final_stream << ' ] }' if in_shard_list == 1
      final_stream << ' ] }'
      output = final_stream.join("\n")
    end

    #Hack to avoid non-json empty sets
    output = "{}" if output == "null\n"
    output.gsub!(/\s*/, '')
    JSON.parse(output)
  end
end
