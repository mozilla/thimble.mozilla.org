## Supported Release 2.3.0
### Summary
A release containing many bugfixes with additional features.

#### Features
- Apt_updates facts now use /usr/bin/apt-get.
- Addition of notify update to apt::source.
- Update to newest modulesync_configs.
- Installs software-properties-common for Xenial.
- Modulesync updates.
- Add ability to specify a hash of apt::conf defines.

#### Bugfixes
- A clean up of spec/defines/key_compat_specs, also now runs under STRICT_VARIABLES.
- Apt::setting expects priority to be an integer, set defaults accordingly.
- Fixed version check for Ubuntu on 16.04.
- Now uses hkps.pool.sks-keyservers.net instead of pgp.mit.edu.
- Updates and fixes to tests. General cleanup.
- Fixed regexp for $ensure params.
- Apt/params: Remove unused LSB facts.
- Replaced `-s` with `-f` in ppa rspec tests - After the repository is added, the "${::apt::sources_list_d}/${sources_list_d_filename}" file is created as an empty file. The unless condition of Exec["add-apt-repository-${name}"] calls test -s, which returns 1 if the file is empty. Because the file is empty, the unless condition is never true and the repository is added on every execution. This change replaces the -s test condition with -f, which is true if the file exists or false otherwise.
- Limit non-strict parsing to pre-3.5.0 only - Puppet 3.5.0 introduced strict variables and the module handles strict variables by using the defined() function. This does not work on prior versions of puppet so we now gate based on that version. Puppet 4 series has a new setting `strict` that may be set to enforce strict variables while `strict_variables` remains unset (see PUP-6358) which causes the conditional in manifests/params.pp to erroniously use non-strict 3.5-era parsing and fail. This new conditional corrects the cases such that strict variable behavior happens on versions 3.5.0 and later.

##Supported Release 2.2.2
###Summary

Several bug fixes and the addition of support updates to Debian 8 and Ubuntu Wily.

####Bugfixes
- Small fixes to descriptions within the readme and the addition of some examples.
- Updates to run on Ubuntu Wily.
- Fixed apt_key tempfile race condition.
- Run stages limitation added to the documentation.
- Remove unneeded whitespace in source.list template.
- Handle PPA names that contain a plus character.
- Update to current msync configs.
- Avoid duplicate package resources when package_manage => true.
- Avoid multiple package resource declarations.
- Ensure PPAs in tests have valid form.
- Look for correct sources.list.d file for apt::ppa.
- Debian 8 support addiiton to metadata.

##Supported Release 2.2.1
###Summary

Small release for support of newer PE versions. This increments the version of PE in the metadata.json file.

##2015-09-29 - Supported Release 2.2.0
###Summary

This release includes a few bugfixes.

####Features
- Adds an `ensure` parameter for user control of proxy presence.
- Adds ability to set `notify_update` to `apt::conf` (MODULES-2269).
- Apt pins no longer trigger an `apt-get update` run.
- Adds support for creating pins from main class.

####Bugfixes
- Updates to use the official Debian mirrors.
- Fixes path to `preferences` and `preferences.d`
- Fixes pinning for backports (MODULES-2446).
- Fixes the name/extension of the preferences files.

##2015-07-28 - Supported Release 2.1.1
###Summary

This release includes a few bugfixes.

####Bugfixes
- Fix incorrect use of anchoring (MODULES-2190)
- Use correct comment type for apt.conf files
- Test fixes
- Documentation fixes

##2015-06-16 - Supported Release 2.1.0
###Summary

This release largely makes `apt::key` and `apt::source` API-compatible with the 1.8.x versions for ease in upgrading, and also addresses some compatibility issues with older versions of Puppet.

####Features
- Add API compatibility to `apt::key` and `apt::source`
- Added `apt_reboot_required` fact

####Bugfixes
- Fix compatibility with Puppet versions 3.0-3.4
- Work around future parser bug PUP-4133

##2015-04-28 - Supported Release 2.0.1
###Summary

This bug fixes a few compatibility issues that came up with the 2.0.0 release, and includes test and documentation updates.

####Bugfixes
- Fix incompatibility with keyrings containing multiple keys
- Fix bugs preventing the module from working with Puppet < 3.5.0

##2015-04-07 - Supported Release 2.0.0
###Summary

This is a major rewrite of the apt module. Many classes and defines were removed, but all existing functionality should still work. Please carefully review documentation before upgrading.

####Backwards-incompatible changes

As this is a major rewrite of the module there are a great number of backwards incompatible changes. Please review this and the updated README carefully before upgrading.

#####`apt_key`
- `keyserver_options` parameter renamed to `options`

#####`apt::backports`
- This no longer works out of the box on Linux Mint. If using this on mint, you must specify the `location`, `release`, `repos`, and `key` parameters. [Example](examples/backports.pp)

#####`apt::builddep`
- This define was removed. Functionality can be matched passing 'build-dep' to `install_options` in the package resource. [Example](examples/builddep.pp)

#####`apt::debian::testing`
- This class was removed. Manually add an `apt::source` instead. [Example](examples/debian_testing.pp)

#####`apt::debian::unstable`
- This class was removed. Manually add an `apt::source` instead. [Example](examples/debian_unstable.pp)

#####`apt::force`
- This define was removed. Functionallity can be matched by setting `install_options` in the package resource. See [here](examples/force.pp) for how to set the options.

#####`apt::hold`
- This define was removed. Simply use an `apt::pin` with `priority => 1001` for the same functionality.

#####`apt`
- `always_apt_update` - This parameter was removed. Use `update => { 'frequency' => 'always' }` instead.
- `apt_update_frequency` - This parameter was removed. Use `update => { 'frequency' => <frequency> }` instead.
- `disable_keys` - This parameter was removed. See this [example](examples/disable_keys.pp) if you need this functionality.
- `proxy_host` - This parameter was removed. Use `proxy => { 'host' => <host> }` instead.
- `proxy_port` - This parameter was removed. Use `proxy => { 'port' => <port> }` instead.
- `purge_sources_list` - This parameter was removed. Use `purge => { 'sources.list' => <bool> }` instead.
- `purge_sources_list_d` - This parameter was removed. Use `purge => { 'sources.list.d' => <bool> }` instead.
- `purge_preferences` - This parameter was removed. Use `purge => { 'preferences' => <bool> }` instead.
- `purge_preferences_d` - This parameter was removed. Use `purge => { 'preferences.d' => <bool> }` instead.
- `update_timeout` - This parameter was removed. Use `update => { 'timeout' => <timeout> }` instead.
- `update_tries` - This parameter was removed. Use `update => { 'tries' => <tries> }` instead.

#####`apt::key`
- `key` - This parameter was renamed to `id`.
- `key_content` - This parameter was renamed to `content`.
- `key_source` - This parameter was renamed to `source`.
- `key_server` - This parameter was renamed to `server`.
- `key_options` - This parameter was renamed to `options`.

#####`apt::release`
- This class was removed. See this [example](examples/release.pp) for how to achieve this functionality.

#####`apt::source`
- `include_src` - This parameter was removed. Use `include => { 'src' => <bool> }` instead. ***NOTE*** This now defaults to false.
- `include_deb` - This parameter was removed. Use `include => { 'deb' => <bool> }` instead.
- `required_packages` - This parameter was removed. Use package resources for these packages if needed.
- `key` - This can either be a key id or a hash including key options. If using a hash, `key => { 'id' => <id> }` must be specified.
- `key_server` - This parameter was removed. Use `key => { 'server' => <server> }` instead.
- `key_content` - This parameter was removed. Use `key => { 'content' => <content> }` instead.
- `key_source` - This parameter was removed. Use `key => { 'source' => <source> }` instead.
- `trusted_source` - This parameter was renamed to `allow_unsigned`.

#####`apt::unattended_upgrades`
- This class was removed and is being republished under the puppet-community namespace. The git repository is available [here](https://github.com/puppet-community/puppet-unattended_upgrades) and it will be published to the forge [here](https://forge.puppetlabs.com/puppet/unattended_upgrades).

####Changes to default behavior
- By default purge unmanaged files in 'sources.list', 'sources.list.d', 'preferences', and 'preferences.d'.
- Changed default for `package_manage` in `apt::ppa` to `false`. Set to `true` in a single PPA if you need the package to be managed.
- `apt::source` will no longer include the `src` entries by default. 
- `pin` in `apt::source` now defaults to `undef` instead of `false`

####Features
- Added the ability to pass hashes of `apt::key`s, `apt::ppa`s, and `apt::setting`s to `apt`.
- Added 'https' key to `proxy` hash to allow disabling `https_proxy` for the `apt::ppa` environment.
- Added `apt::setting` define to abstract away configuration.
- Added the ability to pass hashes to `pin` and `key` in `apt::backports` and `apt::source`.

####Bugfixes
- Fixes for strict variables.

##2015-03-17 - Supported Release 1.8.0
###Summary

This is the last planned feature release of the 1.x series of this module. All new features will be evaluated for puppetlabs-apt 2.x.

This release includes many important features, including support for full fingerprints, and fixes issues where `apt_key` was not supporting user/password and `apt_has_updates` was not properly parsing the `apt-check` output.

####Changes to default behavior
- The apt module will now throw warnings if you don't use full fingerprints for `apt_key`s

####Features
- Use gpg to check keys to work around https://bugs.launchpad.net/ubuntu/+source/gnupg2/+bug/1409117 (MODULES-1675)
- Add 'oldstable' to the default update origins for wheezy
- Add utopic, vivid, and cumulus compatibility
- Add support for full fingerprints
- New parameter for `apt::source`
  - `trusted_source`
- New parameters for `apt::ppa`
  - `package_name`
  - `package_manage`
- New parameter for `apt::unattended_upgrades`
  - `legacy_origin`
- Separate `apt::pin` from `apt::backports` to allow pin by release instead of origin

####Bugfixes
- Cleanup lint and future parser issues
- Fix to support username and passwords again for `apt_key` (MODULES-1119)
- Fix issue where `apt::force` `$install_check` didn't work with non-English locales (MODULES-1231)
- Allow 5 digit ports in `apt_key`
- Fix for `ensure => absent` in `apt_key` (MODULES-1661)
- Fix `apt_has_updates` not parsing `apt-check` output correctly
- Fix inconsistent headers across files (MODULES-1200)
- Clean up formatting for 50unattended-upgrades.erb

##2014-10-28 - Supported Release 1.7.0
###Summary

This release includes several new features, documentation and test improvements, and a few bug fixes.

####Features
- Updated unit and acceptance tests
- Update module to work with Linux Mint
- Documentation updates
- Future parser / strict variables support
- Improved support for long GPG keys
- New parameters!
  - Added `apt_update_frequency` to apt
  - Added `cfg_files` and `cfg_missing` parameters to apt::force
  - Added `randomsleep` to apt::unattended_upgrades
- Added `apt_update_last_success` fact
- Refactored facts for performance improvements

####Bugfixes
- Update apt::builddep to require Exec['apt_update'] instead of notifying it
- Clean up lint errors

##2014-08-20 - Supported Release 1.6.0
###Summary

####Features
- Allow URL or domain name for key_server parameter
- Allow custom comment for sources list
- Enable auto-update for Debian squeeze LTS
- Add facts showing available updates
- Test refactoring

####Bugfixes
- Allow dashes in URL or domain for key_server parameter

##2014-08-13 - Supported Release 1.5.3
###Summary

This is a bugfix releases.  It addresses a bad regex, failures with unicode
characters, and issues with the $proxy_host handling in apt::ppa.

####Features
- Synced files from Modulesync

####Bugfixes
- Fix regex to follow APT requirements in apt::pin
- Fix for unicode characters
- Fix inconsistent $proxy_host handling in apt and apt::ppa
- Fix typo in README
- Fix broken acceptance tests

##2014-07-15 - Supported Release 1.5.2
###Summary

This release merely updates metadata.json so the module can be uninstalled and
upgraded via the puppet module command.

##2014-07-10 - Supported Release 1.5.1
###Summary

This release has added tests to ensure graceful failure on OSX.

##2014-06-04 - Release 1.5.0
###Summary

This release adds support for Ubuntu 14.04.  It also includes many new features 
and important bugfixes.  One huge change is that apt::key was replaced with
apt_key, which allows you to use puppet resource apt_key to inventory keys on
your system.

Special thanks to daenney, our intrepid unofficial apt maintainer!

####Features
- Add support for Ubuntu Trusty!
- Add apt::hold define
- Generate valid *.pref files in apt::pin
- Made pin_priority configurable for apt::backports
- Add apt_key type and provider
- Rename "${apt_conf_d}/proxy" to "${apt_conf_d}/01proxy"
- apt::key rewritten to use apt_key type
- Add support for update_tries to apt::update

####Bugfixes
- Typo fixes
- Fix unattended upgrades
- Removed bogus line when using purge_preferences
- Fix apt::force to upgrade allow packages to be upgraded to the pacakge from the specified release

##2014-03-04 - Supported Release 1.4.2
###Summary

This is a supported release. This release tidies up 1.4.1 and re-enables
support for Ubuntu 10.04

####Features

####Bugfixes
- Fix apt:ppa to include the -y Ubuntu 10.04 requires.
- Documentation changes.
- Test fixups.

####Known Bugs

* No known issues.



##2014-02-13 1.4.1
###Summary
This is a bugfix release.

####Bugfixes
- Fix apt::force unable to upgrade packages from releases other than its original
- Removed a few refeneces to aptitude instead of apt-get for portability
- Removed call to getparam() due to stdlib dependency
- Correct apt::source template when architecture is provided
- Retry package installs if apt is locked
- Use root to exec in apt::ppa
- Updated tests and converted acceptance tests to beaker

##2013-10-08 - Release 1.4.0

###Summary

Minor bugfix and allow the timeout to be adjusted.

####Features
- Add an `updates_timeout` to apt::params

####Bugfixes
- Ensure apt::ppa can read a ppa removed by hand.


##2013-10-08 - Release 1.3.0
###Summary

This major feature in this release is the new apt::unattended_upgrades class,
allowing you to handle Ubuntu's unattended feature.  This allows you to select
specific packages to automatically upgrade without any further user
involvement.

In addition we extend our Wheezy support, add proxy support to apt:ppa and do
various cleanups and tweaks.

####Features
- Add apt::unattended_upgrades support for Ubuntu.
- Add wheezy backports support.
- Use the geoDNS http.debian.net instead of the main debian ftp server.
- Add `options` parameter to apt::ppa in order to pass options to apt-add-repository command.
- Add proxy support for apt::ppa (uses proxy_host and proxy_port from apt).

####Bugfixes
- Fix regsubst() calls to quote single letters (for future parser).
- Fix lint warnings and other misc cleanup.


##2013-07-03 - Release 1.2.0

####Features
- Add geppetto `.project` natures
- Add GH auto-release
- Add `apt::key::key_options` parameter
- Add complex pin support using distribution properties for `apt::pin` via new properties:
  - `apt::pin::codename`
  - `apt::pin::release_version`
  - `apt::pin::component`
  - `apt::pin::originator`
  - `apt::pin::label`
- Add source architecture support to `apt::source::architecture`

####Bugfixes
- Use apt-get instead of aptitude in apt::force
- Update default backports location
- Add dependency for required packages before apt-get update


##2013-06-02 - Release 1.1.1
###Summary

This is a bug fix release that resolves a number of issues:

* By changing template variable usage, we remove the deprecation warnings
  for Puppet 3.2.x
* Fixed proxy file removal, when proxy absent

Some documentation, style and whitespaces changes were also merged. This
release also introduced proper rspec-puppet unit testing on Travis-CI to help
reduce regression.

Thanks to all the community contributors below that made this patch possible.

#### Detail Changes

* fix minor comment type (Chris Rutter)
* whitespace fixes (Michael Moll)
* Update travis config file (William Van Hevelingen)
* Build all branches on travis (William Van Hevelingen)
* Standardize travis.yml on pattern introduced in stdlib (William Van Hevelingen)
* Updated content to conform to README best practices template (Lauren Rother)
* Fix apt::release example in readme (Brian Galey)
* add @ to variables in template (Peter Hoeg)
* Remove deprecation warnings for pin.pref.erb as well (Ken Barber)
* Update travis.yml to latest versions of puppet (Ken Barber)
* Fix proxy file removal (Scott Barber)
* Add spec test for removing proxy configuration (Dean Reilly)
* Fix apt::key listing longer than 8 chars (Benjamin Knofe)




## Release 1.1.0
###Summary

This release includes Ubuntu 12.10 (Quantal) support for PPAs.

---

##2012-05-25 - Puppet Labs <info@puppetlabs.com> - Release 0.0.4
###Summary

 * Fix ppa list filename when there is a period in the PPA name
 * Add .pref extension to apt preferences files
 * Allow preferences to be purged
 * Extend pin support


##2012-05-04 - Puppet Labs <info@puppetlabs.com> - Release 0.0.3
###Summary
 
 * only invoke apt-get update once
 * only install python-software-properties if a ppa is added
 * support 'ensure => absent' for all defined types
 * add apt::conf
 * add apt::backports
 * fixed Modulefile for module tool dependency resolution
 * configure proxy before doing apt-get update
 * use apt-get update instead of aptitude for apt::ppa
 * add support to pin release


##2012-03-26 - Puppet Labs <info@puppetlabs.com> - Release 0.0.2
###Summary

* 41cedbb (#13261) Add real examples to smoke tests.
* d159a78 (#13261) Add key.pp smoke test
* 7116c7a (#13261) Replace foo source with puppetlabs source
* 1ead0bf Ignore pkg directory.
* 9c13872 (#13289) Fix some more style violations
* 0ea4ffa (#13289) Change test scaffolding to use a module & manifest dir fixture path
* a758247 (#13289) Clean up style violations and fix corresponding tests
* 99c3fd3 (#13289) Add puppet lint tests to Rakefile
* 5148cbf (#13125) Apt keys should be case insensitive
* b9607a4 Convert apt::key to use anchors


##2012-03-07 - Puppet Labs <info@puppetlabs.com> - Release 0.0.1
###Summary

* d4fec56 Modify apt::source release parameter test
* 1132a07 (#12917) Add contributors to README
* 8cdaf85 (#12823) Add apt::key defined type and modify apt::source to use it
* 7c0d10b (#12809) $release should use $lsbdistcodename and fall back to manual input
* be2cc3e (#12522) Adjust spec test for splitting purge
* 7dc60ae (#12522) Split purge option to spare sources.list
* 9059c4e Fix source specs to test all key permutations
* 8acb202 Add test for python-software-properties package
* a4af11f Check if python-software-properties is defined before attempting to define it.
* 1dcbf3d Add tests for required_packages change
* f3735d2 Allow duplicate $required_packages
* 74c8371 (#12430) Add tests for changes to apt module
* 97ebb2d Test two sources with the same key
* 1160bcd (#12526) Add ability to reverse apt { disable_keys => true }
* 2842d73 Add Modulefile to puppet-apt
* c657742 Allow the use of the same key in multiple sources
* 8c27963 (#12522) Adding purge option to apt class
* 997c9fd (#12529) Add unit test for apt proxy settings
* 50f3cca (#12529) Add parameter to support setting a proxy for apt
* d522877 (#12094) Replace chained .with_* with a hash
* 8cf1bd0 (#12094) Remove deprecated spec.opts file
* 2d688f4 (#12094) Add rspec-puppet tests for apt
* 0fb5f78 (#12094) Replace name with path in file resources
* f759bc0 (#11953) Apt::force passes $version to aptitude
* f71db53 (#11413) Add spec test for apt::force to verify changes to unless
* 2f5d317 (#11413) Update dpkg query used by apt::force
* cf6caa1 (#10451) Add test coverage to apt::ppa
* 0dd697d include_src parameter in example; Whitespace cleanup
* b662eb8 fix typos in "repositories"
* 1be7457 Fix (#10451) - apt::ppa fails to "apt-get update" when new PPA source is added
* 864302a Set the pin priority before adding the source (Fix #10449)
* 1de4e0a Refactored as per mlitteken
* 1af9a13 Added some crazy bash madness to check if the ppa is installed already. Otherwise the manifest tries to add it on every run!
* 52ca73e (#8720) Replace Apt::Ppa with Apt::Builddep
* 5c05fa0 added builddep command.
* a11af50 added the ability to specify the content of a key
* c42db0f Fixes ppa test.
* 77d2b0d reformatted whitespace to match recommended style of 2 space indentation.
* 27ebdfc ignore swap files.
* 377d58a added smoke tests for module.
* 18f614b reformatted apt::ppa according to recommended style.
* d8a1e4e Created a params class to hold global data.
* 636ae85 Added two params for apt class
* 148fc73 Update LICENSE.
* ed2d19e Support ability to add more than one PPA
* 420d537 Add call to apt-update after add-apt-repository in apt::ppa
* 945be77 Add package definition for python-software-properties
* 71fc425 Abs paths for all commands
* 9d51cd1 Adding LICENSE
* 71796e3 Heading fix in README
* 87777d8 Typo in README
* f848bac First commit
