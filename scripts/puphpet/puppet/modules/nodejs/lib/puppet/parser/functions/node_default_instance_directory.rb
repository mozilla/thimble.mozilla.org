module Puppet::Parser::Functions
  newfunction(:node_default_instance_directory, :type => :rvalue) do |args|
    target_dir  = args[0]
    default_dir = "#{target_dir}/node-default"

    unless File.exist?(default_dir)
      raise Puppet::Error, "Invalid node symlink #{default_dir}! " \
        "(Did you try to remove a nodejs instance " \
        "a run where the node setup will be done the first time?)"
    end

    File.readlink(default_dir)
  end
end
