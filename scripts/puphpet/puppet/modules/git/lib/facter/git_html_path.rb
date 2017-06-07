# Fact: git_html_path
#
# Purpose: get git's html path
#
# Resolution:
#   Uses git's --html-path flag
#
# Caveats:
#   none
#
# Notes:
#   None
Facter.add('git_html_path') do
  case Facter.value(:osfamily)
  when 'windows'
    null_path = 'nul'
  else
    null_path = '/dev/null'
  end
  git_html_path_cmd = "git --html-path 2>#{null_path}"
  setcode do
    Facter::Util::Resolution.exec(git_html_path_cmd)
  end
end
