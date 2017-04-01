# Class: archive
# ==============
#
# Manages archive modules dependencies.
#
# Parameters
# ----------
#
# * seven_zip_name: 7zip package name.
# * seven_zip_provider: 7zip package provider (accepts windows/chocolatey).
# * seven_zip_source: alternative package source.
# * aws_cli_install: install aws cli command (default: false).
#
# Examples
# --------
#
# class { 'archive':
#   seven_zip_name     => '7-Zip 9.20 (x64 edition)',
#   seven_zip_source   => 'C:/Windows/Temp/7z920-x64.msi',
#   seven_zip_provider => 'windows',
# }
#
class archive (
  $seven_zip_name     = $archive::params::seven_zip_name,
  $seven_zip_provider = $archive::params::seven_zip_provider,
  $seven_zip_source   = undef,
  $aws_cli_install    = false,
) inherits archive::params {

  if $::osfamily == 'Windows' and !($seven_zip_provider in ['', undef]) {
    package { '7zip':
      ensure   => present,
      name     => $seven_zip_name,
      source   => $seven_zip_source,
      provider => $seven_zip_provider,
    }
  }

  if $aws_cli_install {
    # TODO: Windows support.
    if $::osfamily != 'Windows' {
      # Using bundled install option:
      # http://docs.aws.amazon.com/cli/latest/userguide/installing.html#install-bundle-other-os

      file { '/opt/awscli-bundle':
        ensure => 'directory',
      }

      archive { 'awscli-bundle.zip':
        ensure       => present,
        path         =>  '/opt/awscli-bundle/awscli-bundle.zip',
        source       => 'https://s3.amazonaws.com/aws-cli/awscli-bundle.zip',
        extract      => true,
        extract_path => '/opt',
        creates      => '/opt/awscli-bundle/install',
        cleanup      => true,
      }

      exec { 'install_aws_cli':
        command     => '/opt/awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws',
        refreshonly => true,
        subscribe   => Archive['awscli-bundle.zip'],
      }
    }
  }
}
