#if you need to specify a release
$rel_string = '-t <release>'
#else
$rel_string = ''

#if you need to specify a version
$ensure = '<version>'
#else 
$ensure = installed

#if overwrite existing cfg files
$config_files = '-o Dpkg::Options::="--force-confnew"'
#elsif force use of old files
$config_files = '-o Dpkg::Options::="--force-confold"'
#elsif update only unchanged files
$config_files = '-o Dpkg::Options::="--force-confdef"'
#else
$config_files = ''

#if install missing configuration files for the package
$config_missing = '-o Dpkg::Options::="--force-confmiss"'
#else
$config_missing = ''

package { '<package>':
  ensure          => $ensure,
  install_options => "${config_files} ${config_missing} ${rel_string}",
}
