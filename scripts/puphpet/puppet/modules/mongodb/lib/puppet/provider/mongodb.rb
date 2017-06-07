require 'yaml'
require 'json'
class Puppet::Provider::Mongodb < Puppet::Provider

  # Without initvars commands won't work.
  initvars
  commands :mongo => 'mongo'

  # Optional defaults file
  def self.mongorc_file
    if File.file?("#{Facter.value(:root_home)}/.mongorc.js")
      "load('#{Facter.value(:root_home)}/.mongorc.js'); "
    else
      nil
    end
  end

  def mongorc_file
    self.class.mongorc_file
  end

  def self.get_mongod_conf_file
    if File.exists? '/etc/mongod.conf'
      file = '/etc/mongod.conf'
    else
      file = '/etc/mongodb.conf'
    end
    file
  end

  def self.get_mongo_conf
    file = get_mongod_conf_file
    # The mongo conf is probably a key-value store, even though 2.6 is
    # supposed to use YAML, because the config template is applied
    # based on $::mongodb::globals::version which is the user will not
    # necessarily set. This attempts to get the port from both types of
    # config files.
    config = YAML.load_file(file)
    config_hash = Hash.new
    if config.kind_of?(Hash) # Using a valid YAML file for mongo 2.6
      config_hash['bindip'] = config['net.bindIp']
      config_hash['port'] = config['net.port']
      config_hash['ipv6'] = config['net.ipv6']
      config_hash['ssl'] = config['net.ssl.mode']
      config_hash['sslcert'] = config['net.ssl.PEMKeyFile']
      config_hash['sslca'] = config['net.ssl.CAFile']
      config_hash['auth'] = config['security.authorization']
      config_hash['shardsvr'] = config['sharding.clusterRole']
      config_hash['confsvr'] = config['sharding.clusterRole']
    else # It has to be a key-value config file
      config = {}
      File.readlines(file).collect do |line|
        k,v = line.split('=')
        config[k.rstrip] = v.lstrip.chomp if k and v
      end
      config_hash['bindip'] = config['bind_ip']
      config_hash['port'] = config['port']
      config_hash['ipv6'] = config['ipv6']
      config_hash['ssl'] = config['sslMode']
      config_hash['sslcert'] = config['sslPEMKeyFile']
      config_hash['sslca'] = config['sslCAFile']
      config_hash['auth'] = config['auth']
      config_hash['shardsvr'] = config['shardsvr']
      config_hash['confsvr'] = config['confsvr']
    end

    config_hash
  end

  def self.ipv6_is_enabled(config=nil)
    config ||= get_mongo_conf
    config['ipv6']
  end

  def self.ssl_is_enabled(config=nil)
    config ||= get_mongo_conf
    ssl_mode = config.fetch('ssl')
    ssl_mode.nil? ? false : ssl_mode != 'disabled'
  end

  def self.mongo_cmd(db, host, cmd)
    config = get_mongo_conf

    args = [db, '--quiet', '--host', host]
    args.push('--ipv6') if ipv6_is_enabled(config)

    if ssl_is_enabled(config)
      args.push('--ssl')
      args += ['--sslPEMKeyFile', config['sslcert']]

      ssl_ca = config['sslca']
      unless ssl_ca.nil?
        args += ['--sslCAFile', ssl_ca]
      end
    end

    args += ['--eval', cmd]
    mongo(args)
  end

  def self.get_conn_string
    config = get_mongo_conf
    bindip = config.fetch('bindip')
    if bindip
      first_ip_in_list = bindip.split(',').first
      case first_ip_in_list
      when '0.0.0.0'
        ip_real = '127.0.0.1'
      when /\[?::0\]?/
        ip_real = '::1'
      else
        ip_real = first_ip_in_list
      end
    end

    port = config.fetch('port')
    shardsvr = config.fetch('shardsvr')
    confsvr = config.fetch('confsvr')
    if port
      port_real = port
    elsif !port and (confsvr.eql? 'configsvr' or confsvr.eql? 'true')
      port_real = 27019
    elsif !port and (shardsvr.eql? 'shardsvr' or shardsvr.eql? 'true')
      port_real = 27018
    else
      port_real = 27017
    end

    "#{ip_real}:#{port_real}"
  end

  def self.db_ismaster
    cmd_ismaster = 'printjson(db.isMaster())'
    if mongorc_file
      cmd_ismaster = mongorc_file + cmd_ismaster
    end
    db = 'admin'
    out = mongo_cmd(db, get_conn_string, cmd_ismaster)
    out.gsub!(/ObjectId\(([^)]*)\)/, '\1')
    out.gsub!(/ISODate\((.+?)\)/, '\1 ')
    out.gsub!(/^Error\:.+/, '')
    res = JSON.parse out

    return res['ismaster']
  end

  def db_ismaster
    self.class.db_ismaster
  end

  def self.auth_enabled(config=nil)
    config ||= get_mongo_conf
    config['auth']
  end

  # Mongo Command Wrapper
  def self.mongo_eval(cmd, db = 'admin', retries = 10, host = nil)
    retry_count = retries
    retry_sleep = 3
    if mongorc_file
      cmd = mongorc_file + cmd
    end

    out = nil
    retry_count.times do |n|
      begin
        if host
          out = mongo_cmd(db, host, cmd)
        else
          out = mongo_cmd(db, get_conn_string, cmd)
        end
      rescue => e
        Puppet.debug "Request failed: '#{e.message}' Retry: '#{n}'"
        sleep retry_sleep
        next
      end
      break
    end

    if !out
      raise Puppet::ExecutionFailure, "Could not evalute MongoDB shell command: #{cmd}"
    end

    ['ObjectId','NumberLong'].each do |data_type|
      out.gsub!(/#{data_type}\(([^)]*)\)/, '\1')
    end
    out.gsub!(/^Error\:.+/, '')
    out
  end

  def mongo_eval(cmd, db = 'admin', retries = 10, host = nil)
    self.class.mongo_eval(cmd, db, retries, host)
  end

  # Mongo Version checker
  def self.mongo_version
    @@mongo_version ||= self.mongo_eval('db.version()')
  end

  def mongo_version
    self.class.mongo_version
  end

  def self.mongo_24?
    v = self.mongo_version
    ! v[/^2\.4\./].nil?
  end

  def mongo_24?
    self.class.mongo_24?
  end

end
