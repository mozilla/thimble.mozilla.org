# == Define: apt::key
define apt::key (
  $id          = $title,
  $ensure      = present,
  $content     = undef,
  $source      = undef,
  $server      = $::apt::keyserver,
  $options     = undef,
  $key         = undef,
  $key_content = undef,
  $key_source  = undef,
  $key_server  = undef,
  $key_options = undef,
) {

  if $key != undef {
    warning('$key is deprecated and will be removed in the next major release. Please use $id instead.')
    $_id = $key
  } else {
    $_id = $id
  }

  if $key_content != undef {
    warning('$key_content is deprecated and will be removed in the next major release. Please use $content instead.')
    $_content = $key_content
  } else {
    $_content = $content
  }

  if $key_source != undef {
    warning('$key_source is deprecated and will be removed in the next major release. Please use $source instead.')
    $_source = $key_source
  } else {
    $_source = $source
  }

  if $key_server != undef {
    warning('$key_server is deprecated and will be removed in the next major release. Please use $server instead.')
    $_server = $key_server
  } else {
    $_server = $server
  }

  if $key_options != undef {
    warning('$key_options is deprecated and will be removed in the next major release. Please use $options instead.')
    $_options = $key_options
  } else {
    $_options = $options
  }

  validate_re($_id, ['\A(0x)?[0-9a-fA-F]{8}\Z', '\A(0x)?[0-9a-fA-F]{16}\Z', '\A(0x)?[0-9a-fA-F]{40}\Z'])
  validate_re($ensure, ['\A(absent|present)\Z',])

  if $_content {
    validate_string($_content)
  }

  if $_source {
    validate_re($_source, ['\Ahttps?:\/\/', '\Aftp:\/\/', '\A\/\w+'])
  }

  if $_server {
    validate_re($_server,['\A((hkp|http|https):\/\/)?([a-z\d])([a-z\d-]{0,61}\.)+[a-z\d]+(:\d{2,5})?$'])
  }

  if $_options {
    validate_string($_options)
  }

  case $ensure {
    present: {
      if defined(Anchor["apt_key ${_id} absent"]){
        fail("key with id ${_id} already ensured as absent")
      }

      if !defined(Anchor["apt_key ${_id} present"]) {
        apt_key { $title:
          ensure  => $ensure,
          id      => $_id,
          source  => $_source,
          content => $_content,
          server  => $_server,
          options => $_options,
        } ->
        anchor { "apt_key ${_id} present": }
      }
    }

    absent: {
      if defined(Anchor["apt_key ${_id} present"]){
        fail("key with id ${_id} already ensured as present")
      }

      if !defined(Anchor["apt_key ${_id} absent"]){
        apt_key { $title:
          ensure  => $ensure,
          id      => $_id,
          source  => $_source,
          content => $_content,
          server  => $_server,
          options => $_options,
        } ->
        anchor { "apt_key ${_id} absent": }
      }
    }

    default: {
      fail "Invalid 'ensure' value '${ensure}' for apt::key"
    }
  }
}
