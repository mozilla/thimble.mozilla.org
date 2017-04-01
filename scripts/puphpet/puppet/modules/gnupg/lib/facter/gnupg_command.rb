# Fact: gnupg_command
#
# Purpose: get full path to gpg exe
#
# Resolution:
#   Tests for presence of gpg, returns nil if not present
#   returns output of which gpg
#
# Caveats:
#   none
#
# Notes:
#   None
Facter.add(:gnupg_command) do
  setcode do
    Facter::Util::Resolution.which('gpg')
  end
end
