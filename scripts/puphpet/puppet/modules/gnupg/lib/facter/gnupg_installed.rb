# Fact: gnupg_installed
#
# Purpose: determine if gpg exe exists on system
#
# Resolution:
#   Tests for presence of gpg, returns false if not present
#   returns true if which gpg finds an exe
#
# Caveats:
#   none
#
# Notes:
#   None
Facter.add(:gnupg_installed) do
  setcode do
    !Facter.value(:gnupg_command).nil?
  end
end
