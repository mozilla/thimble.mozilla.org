require 'semver'

module Puppet::Parser::Functions
  newfunction(:is_binary_download_available, :type => :rvalue) do |args|

    # since version v0.10.0 nodejs.org provides binary files
    binaryAvailable = SemVer.new('v0.10.0')
    currentVersion = SemVer.new(args[0]);

    (currentVersion >= binaryAvailable)
  end
end
