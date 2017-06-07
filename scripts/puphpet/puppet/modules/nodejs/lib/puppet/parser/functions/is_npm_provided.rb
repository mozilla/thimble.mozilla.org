require 'semver'

module Puppet::Parser::Functions
  newfunction(:is_npm_provided, :type => :rvalue) do |args|

    # since version v0.6.3 npm is provided via nodejs
    nodeProvidesNpmVersion = SemVer.new('v0.6.3')
    currentVersion = SemVer.new(args[0]);

    (currentVersion >= nodeProvidesNpmVersion)
  end
end
