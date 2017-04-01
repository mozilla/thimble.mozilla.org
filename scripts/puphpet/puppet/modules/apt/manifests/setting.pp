define apt::setting (
  $priority      = 50,
  $ensure        = file,
  $source        = undef,
  $content       = undef,
  $notify_update = true,
) {

  include 'apt::params'
  if $content and $source {
    fail('apt::setting cannot have both content and source')
  }

  if !$content and !$source {
    fail('apt::setting needs either of content or source')
  }

  validate_re($ensure,  ['file', 'present', 'absent'])
  validate_bool($notify_update)

  $title_array = split($title, '-')
  $setting_type = $title_array[0]
  $base_name = join(delete_at($title_array, 0), '-')

  validate_re($setting_type, ['\Aconf\z', '\Apref\z', '\Alist\z'], "apt::setting resource name/title must start with either 'conf-', 'pref-' or 'list-'")

  unless is_integer($priority) {
    # need this to allow zero-padded priority.
    validate_re($priority, '^\d+$', 'apt::setting priority must be an integer or a zero-padded integer')
  }

  if $source {
    validate_string($source)
  }

  if $content {
    validate_string($content)
  }

  if ($setting_type == 'list') or ($setting_type == 'pref') {
    $_priority = ''
  } else {
    $_priority = $priority
  }

  $_path = $::apt::params::config_files[$setting_type]['path']
  $_ext  = $::apt::params::config_files[$setting_type]['ext']

  if $notify_update {
    $_notify = Class['apt::update']
  } else {
    $_notify = undef
  }

  file { "${_path}/${_priority}${base_name}${_ext}":
    ensure  => $ensure,
    owner   => 'root',
    group   => 'root',
    mode    => '0644',
    content => $content,
    source  => $source,
    notify  => $_notify,
  }
}
