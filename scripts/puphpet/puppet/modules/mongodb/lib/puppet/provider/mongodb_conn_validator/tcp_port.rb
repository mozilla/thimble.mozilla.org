$LOAD_PATH.unshift(File.join(File.dirname(__FILE__),"..","..",".."))
require 'puppet/util/mongodb_validator'

# This file contains a provider for the resource type `mongodb_conn_validator`,
# which validates the mongodb connection by attempting an https connection.

Puppet::Type.type(:mongodb_conn_validator).provide(:tcp_port) do
  desc "A provider for the resource type `mongodb_conn_validator`,
        which validates the mongodb connection by attempting an https
        connection to the mongodb server.  Uses the puppet SSL certificate
        setup from the local puppet environment to authenticate."

  def exists?
    start_time = Time.now
    timeout = resource[:timeout]

    success = validator.attempt_connection

    while success == false && ((Time.now - start_time) < timeout)
      # It can take several seconds for the mongodb server to start up;
      # especially on the first install.  Therefore, our first connection attempt
      # may fail.  Here we have somewhat arbitrarily chosen to retry every 4
      # seconds until the configurable timeout has expired.
      Puppet.debug("Failed to connect to mongodb; sleeping 4 seconds before retry")
      sleep 4
      success = validator.attempt_connection
    end

    if success
      Puppet.debug("Connected to mongodb in #{Time.now - start_time} seconds.")
    else
      Puppet.notice("Failed to connect to mongodb within timeout window of #{timeout} seconds; giving up.")
    end

    success
  end

  def create
    # If `#create` is called, that means that `#exists?` returned false, which
    # means that the connection could not be established... so we need to
    # cause a failure here.
    raise Puppet::Error, "Unable to connect to mongodb server! (#{@validator.mongodb_server}:#{@validator.mongodb_port})"
  end

  private

  # @api private
  def validator
    @validator ||= Puppet::Util::MongodbValidator.new(resource[:name], resource[:server], resource[:port])
  end

end

