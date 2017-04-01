# == Definition: archive::download
#
# Archive downloader with integrity verification.
#
# Parameters:
#
# - *$url:
# - *$digest_url:
# - *$digest_string: Default value undef
# - *$digest_type: Default value "md5".
# - *$timeout: Default value 120. (ignored)
# - *$src_target: Default value "/usr/src".
# - *$allow_insecure: Default value false.
# - *$follow_redirects: Default value false.
# - *$verbose: Default value true.
# - *$proxy_server: Default value undef.
# - *$user: The user used to download the archive
#
# Example usage:
#
#  archive::download {"apache-tomcat-6.0.26.tar.gz":
#    ensure => present,
#    url    => "http://archive.apache.org/dist/tomcat/tomcat-6/v6.0.26/bin/apache-tomcat-6.0.26.tar.gz",
#  }
#
#  archive::download {"apache-tomcat-6.0.26.tar.gz":
#    ensure        => present,
#    digest_string => "f9eafa9bfd620324d1270ae8f09a8c89",
#    url           => "http://archive.apache.org/dist/tomcat/tomcat-6/v6.0.26/bin/apache-tomcat-6.0.26.tar.gz",
#  }
#
define archive::download (
  $url,
  $ensure           = present,
  $checksum         = true,
  $digest_url       = undef,
  $digest_string    = undef,
  $digest_type      = 'md5',   # bad default!
  $timeout          = 120,     # ignored
  $src_target       = '/usr/src',
  $allow_insecure   = false,   # ignored
  $follow_redirects = false,   # ignored (default)
  $verbose          = true,    # ignored
  $path             = $::path, # ignored
  $proxy_server     = undef,
  $user             = undef,
) {

  $target = is_absolute_path($title) ? {
    false   => "${src_target}/${title}",
    default => $title,
  }

  archive { $target:
    ensure          => $ensure,
    source          => $url,
    checksum_verify => $checksum,
    checksum        => $digest_string,
    checksum_type   => $digest_type,
    checksum_url    => $digest_url,
    proxy_server    => $proxy_server,
    user            => $user,
  }
}
