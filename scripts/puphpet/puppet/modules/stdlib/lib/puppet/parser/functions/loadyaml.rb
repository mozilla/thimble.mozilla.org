module Puppet::Parser::Functions

  newfunction(:loadyaml, :type => :rvalue, :doc => <<-'ENDHEREDOC') do |args|
    Load a YAML file containing an array, string, or hash, and return the data
    in the corresponding native data type.

    For example:

        $myhash = loadyaml('/etc/puppet/data/myhash.yaml')
    ENDHEREDOC

    unless args.length == 1
      raise Puppet::ParseError, ("loadyaml(): wrong number of arguments (#{args.length}; must be 1)")
    end

    if File.exists?(args[0]) then
      YAML.load_file(args[0])
    else
      warning("Can't load " + args[0] + ". File does not exist!")
      nil
    end

  end

end
