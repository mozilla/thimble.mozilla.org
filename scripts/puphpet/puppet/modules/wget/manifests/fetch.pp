################################################################################
# Definition: wget::fetch
#
# This defined type will download files from the internet.  You may define a
# web proxy using $http_proxy if necessary.
#
# == Parameters:
#  $source_hash:        MD5-sum of the content to be downloaded,
#                       if content exists, but does not match it is removed
#                       before downloading
#
################################################################################
define wget::fetch (
  $destination,
  $source             = $title,
  $source_hash        = undef,
  $timeout            = '0',
  $verbose            = false,
  $redownload         = false,
  $nocheckcertificate = false,
  $no_cookies         = false,
  $execuser           = undef,
  $user               = undef,
  $password           = undef,
  $headers            = undef,
  $cache_dir          = undef,
  $cache_file         = undef,
  $flags              = undef,
  $backup             = true,
  $mode               = undef,
  $unless             = undef,
) {

  include wget

  # The strict_variables setting aborts compilation referencing unset variables.
  $strict = defined('$::settings::strict_variables') and $::settings::strict_variables

  if $strict and !defined('$schedule') {
    $schedule = undef
  }

  # Does $destination end in a slash? If so, treat as a directory
  case $destination   {
    # This is a nasty looking regex but it's simply checking to see if the $destination
    # ends in either forward slash "\" (Linux) or backwards slash "/" (Windows)
    /^.*\/$/, /^.*\$/:  {
      $source_split    = split($source, '/')  # split the URL into arrays, using "/" as a delimiter
      $source_filename = $source_split[-1]    # take the very last value in the array. this is the filename
      $_destination    = "${destination}/${source_filename}"
    }
    default: {
      $_destination = $destination
    }
  }

  if $strict and !defined('$::http_proxy') {
    $http_proxy = undef
  } else {
    $http_proxy = $::http_proxy
  }
  if $strict and !defined('$::https_proxy') {
    $https_proxy = undef
  } else {
    $https_proxy = $::https_proxy
  }

  $http_proxy_env = $http_proxy ? {
    undef   => [],
    default => [ "HTTP_PROXY=${http_proxy}", "http_proxy=${http_proxy}" ],
  }
  $https_proxy_env = $https_proxy ? {
    undef   => [],
    default => [ "HTTPS_PROXY=${https_proxy}", "https_proxy=${https_proxy}" ],
  }
  $password_env = $user ? {
    undef   => [],
    default => [ "WGETRC=${_destination}.wgetrc" ],
  }

  # not using stdlib.concat to avoid extra dependency
  $environment = split(inline_template('<%= (@http_proxy_env+@https_proxy_env+@password_env).join(\',\') %>'),',')

  $verbose_option = $verbose ? {
    true  => '--verbose',
    false => '--no-verbose'
  }

  # Windows exec unless testing requires different syntax
  if ($::operatingsystem == 'windows') {
    $exec_path = $::path
    $unless_test = "cmd.exe /c \"dir ${_destination}\""
  } else {
    $exec_path = '/usr/bin:/usr/sbin:/bin:/usr/local/bin:/opt/local/bin:/usr/sfw/bin'
    if $unless != undef {
      $unless_test = $unless
    }
    elsif $redownload == true or $cache_dir != undef  {
      $unless_test = 'test'
    } else {
      $unless_test = "test -s '${_destination}'"
    }
  }

  $nocheckcert_option = $nocheckcertificate ? {
    true  => ' --no-check-certificate',
    false => ''
  }

  $no_cookies_option = $no_cookies ? {
    true  => ' --no-cookies',
    false => '',
  }

  $user_option = $user ? {
    undef   => '',
    default => " --user=${user}",
  }

  if $user != undef {
    $wgetrc_content = $::operatingsystem ? {
      # This is to work around an issue with macports wget and out of date CA cert bundle.  This requires
      # installing the curl-ca-bundle package like so:
      #
      # sudo port install curl-ca-bundle
      'Darwin' => "password=${password}\nCA_CERTIFICATE=/opt/local/share/curl/curl-ca-bundle.crt\n",
      default  => "password=${password}",
    }

    file { "${_destination}.wgetrc":
      owner    => $execuser,
      mode     => '0600',
      content  => $wgetrc_content,
      before   => Exec["wget-${name}"],
      schedule => $schedule,
    }
  }

  $output_option = $cache_dir ? {
    undef   => " --output-document=\"${_destination}\"",
    default => " -N -P \"${cache_dir}\"",
  }

  # again, not using stdlib.concat, concatanate array of headers into a single string
  if $headers != undef {
    $headers_all = inline_template('<% @headers.each do | header | -%> --header "<%= header -%>"<% end -%>')
  }

  $header_option = $headers ? {
    undef   => '',
    default => $headers_all,
  }

  $flags_joined = $flags ? {
    undef => '',
    default => inline_template(' <%= @flags.join(" ") %>')
  }

  $exec_user = $cache_dir ? {
    undef   => $execuser,
    default => undef,
  }

  case $source_hash{
    '', undef: {
      $command = "wget ${verbose_option}${nocheckcert_option}${no_cookies_option}${header_option}${user_option}${output_option}${flags_joined} \"${source}\""
    }
    default: {
      $command = "wget ${verbose_option}${nocheckcert_option}${no_cookies_option}${header_option}${user_option}${output_option}${flags_joined} \"${source}\" && echo '${source_hash}  ${_destination}' | md5sum -c --quiet"
    }
  }




  exec { "wget-${name}":
    command     => $command,
    timeout     => $timeout,
    unless      => $unless_test,
    environment => $environment,
    user        => $exec_user,
    path        => $exec_path,
    require     => Package['wget'],
    schedule    => $schedule,
  }

  if $cache_dir != undef {
    $cache = $cache_file ? {
      undef   => inline_template('<%= require \'uri\'; File.basename(URI::parse(@source).path) %>'),
      default => $cache_file,
    }
    file { $_destination:
      ensure   => file,
      source   => "${cache_dir}/${cache}",
      owner    => $execuser,
      mode     => $mode,
      require  => Exec["wget-${name}"],
      backup   => $backup,
      schedule => $schedule,
    }
  }

  # remove destination if source_hash is invalid
  if $source_hash != undef {
    exec { "wget-source_hash-check-${name}":
      command  => "test ! -e '${_destination}' || rm ${_destination}",
      path     => '/usr/bin:/usr/sbin:/bin:/usr/local/bin:/opt/local/bin',
      # only remove destination if md5sum does not match $source_hash
      unless   => "echo '${source_hash}  ${_destination}' | md5sum -c --quiet",
      notify   => Exec["wget-${name}"],
      schedule => $schedule,
    }
  }
}
