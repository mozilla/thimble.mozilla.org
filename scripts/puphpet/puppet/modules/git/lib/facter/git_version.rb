# Fact: git_version
#
# Purpose: get git's current version
#
# Resolution:
#   Uses git's --version flag and parses the result from 'version'
#
# Caveats:
#   none
#
# Notes:
#   None
Facter.add('git_version') do
  setcode do
    if Facter::Util::Resolution.which('git')
      git_version_cmd = 'git --version 2>&1'
      git_version_result = Facter::Util::Resolution.exec(git_version_cmd)
      git_version_result.to_s.lines.first.strip.split(/version/)[1].strip
    end
  end
end
