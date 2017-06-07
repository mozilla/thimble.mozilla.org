Puppet::Type.newtype(:mongodb_conn_validator) do

  @doc = "Verify that a connection can be successfully established between a node
          and the mongodb server.  Its primary use is as a precondition to
          prevent configuration changes from being applied if the mongodb
          server cannot be reached, but it could potentially be used for other
          purposes such as monitoring."

  ensurable do
    defaultvalues
    defaultto :present
  end

  newparam(:name, :namevar => true) do
    desc 'An arbitrary name used as the identity of the resource. It can also be the connection string to test (ie. 127.0.0.1:27017)'
  end

  newparam(:server) do
    desc 'An array containing DNS names or IP addresses of the server where mongodb should be running.'
    defaultto '127.0.0.1'
    munge do |value|
      Array(value).first
    end
  end

  newparam(:port) do
    desc 'The port that the mongodb server should be listening on.'
    defaultto '27017'
  end

  newparam(:timeout) do
    desc 'The max number of seconds that the validator should wait before giving up and deciding that puppetdb is not running; defaults to 60 seconds.'
    defaultto 60

    validate do |value|
      # This will raise an error if the string is not convertible to an integer
      Integer(value)
    end

    munge do |value|
      Integer(value)
    end
  end

end
