# Definition: datacat
#
# This definition allows you to declare datacat managed files.
#
# Parameters:
# All parameters are as for the file type, with the addition of a $template
# parameter which is a path to a template to be used as the content of the
# file.
#
# Sample Usage:
#  datacat { '/etc/motd':
#    owner => 'root',
#    group => 'root,
#    template => 'motd/motd.erb',
#  }
#
define datacat(
  $ensure                  = 'file',
  $template                = undef,
  $template_body           = undef,
  $collects                = [],
  $backup                  = undef,
  $checksum                = undef,
  $force                   = undef,
  $group                   = undef,
  $owner                   = undef,
  $mode                    = undef,
  $path                    = $title,
  $replace                 = undef,
  $selinux_ignore_defaults = undef,
  $selrange                = undef,
  $selrole                 = undef,
  $seltype                 = undef,
  $seluser                 = undef,
  $show_diff               = 'UNSET'
) {
  if $show_diff != 'UNSET' {
    if versioncmp($settings::puppetversion, '3.2.0') >= 0 {
      File { show_diff => $show_diff }
    } else {
      warning('show_diff not supported in puppet prior to 3.2, ignoring')
    }
  }

  # we could validate ensure by simply passing it to file, but unfortunately
  # someone could try to be smart and pass 'directory', so we only allow a limited range
  if $ensure != 'absent' and $ensure != 'present' and $ensure != 'file' {
    fail("Datacat[${title}] invalid value for ensure")
  }

  if $ensure == 'absent' {
    file { $title:
      ensure                  => $ensure,
      path                    => $path,
      backup                  => $backup,
      force                   => $force,
    }
  } else {
    file { $title:
      path                    => $path,
      backup                  => $backup,
      checksum                => $checksum,
      content                 => "To be replaced by datacat_collector[${title}]\n",
      force                   => $force,
      group                   => $group,
      mode                    => $mode,
      owner                   => $owner,
      replace                 => $replace,
      selinux_ignore_defaults => $selinux_ignore_defaults,
      selrange                => $selrange,
      selrole                 => $selrole,
      seltype                 => $seltype,
      seluser                 => $seluser,
    }

    $template_real = $template ? {
      undef   => 'inline',
      default => $template,
    }

    $template_body_real = $template_body ? {
      undef   => template_body($template_real),
      default => $template_body,
    }

    datacat_collector { $title:
      template        => $template_real,
      template_body   => $template_body_real,
      target_resource => File[$title], # when we evaluate we modify the private data of this resource
      target_field    => 'content',
      collects        => $collects,
      before          => File[$title], # we want to evaluate before that resource so it can do the work
    }
  }
}
