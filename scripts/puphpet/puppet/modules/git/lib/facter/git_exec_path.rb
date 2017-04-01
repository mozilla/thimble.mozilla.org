# Fact: git_exec_path
#
# Purpose: get git's exec path
#
# Resolution:
#   Uses git's --exec-path flag
#
# Caveats:
#   none
#
# Notes:
#   None
Facter.add('git_exec_path') do
  case Facter.value(:osfamily)
  when 'windows'
    null_path = 'nul'
  else
    null_path = '/dev/null'
  end
  git_exec_path_cmd = "git --exec-path 2>#{null_path}"
  setcode do
    Facter::Util::Resolution.exec(git_exec_path_cmd)
  end
end

