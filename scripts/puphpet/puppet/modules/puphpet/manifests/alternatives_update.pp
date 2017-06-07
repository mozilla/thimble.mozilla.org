# from http://tech.akom.net/archives/94-Simple-puppet-update-alternatives.html

define puphpet::alternatives_update (
  $versiongrep,       # string to pass to grep to select an alternative, ie '1.8'
  $item     = $title, # the item to manage, ie "java"
  $optional = true,   # if false, execution will fail if the version is not found
  $altcmd   = 'update-alternatives' # command to use
) {

  if ! $optional {
    # verify that we have exactly 1 matching alternatives, unless it's optional
    exec { "check alternatives for ${item}":
      path    => ['/sbin','/bin','/usr/bin','/usr/sbin'],
      command => "echo Alternative for ${item} version containing ${versiongrep} was not found, or multiple found ; false",
      unless  => "test $(${altcmd} --display ${item} | grep '^/' | grep ${versiongrep} | wc -l) -eq 1",
      before  => Exec["update alternatives for ${item} to ${versiongrep}"],
    }
  }

  # Runs the update alternatives command
  #  - unless it reports that it's already set to that version
  #  - unless that version is not found via grep
  exec { "update alternatives for ${item} to ${versiongrep}":
    path    => ['/sbin','/bin','/usr/bin','/usr/sbin'],
    command => "${altcmd} --set ${item} $( ${altcmd} --display ${item} | grep '^/' | grep ${versiongrep} | sed 's/ .*$//')",
    unless  => "${altcmd} --display ${item} | grep 'currently points' | grep ${versiongrep}",
    # check that there is one (if optional and not found, this won't run)
    onlyif  => "${altcmd} --display ${item} | grep '^/' | grep ${versiongrep}",
  }

}
