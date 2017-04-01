## 0.13.2 (August 29, 2016)

### Summary
Primarily a bugfix release to resolve HTTPS use in elasticsearch::template resources, 5.x plugin operations, and plugin file permission enforcement.

#### Features
* Plugin installation for the 5.x series of Elasticsearch is now properly supported.

#### Bugfixes
* Recursively enforce correct plugin directory mode to avoid Elasticsearch startup permissions errors.
* Fixed an edge case where dependency cycles could arise when managing absent resources.
* Elasticsearch templates now properly use HTTPS when instructed to do so.

#### Changes
* Updated the elasticsearch_template type to return more helpful error output.
* Updated the es_instance_conn_validator type to silence deprecation warnings in Puppet >= 4.

#### Testing changes

## 0.13.1 (August 8, 2016)

### Summary
Lingering bugfixes from elasticsearch::template changes.
More robust systemd mask handling.
Updated some upstream module parameters for deprecation warnings.
Support for the Shield `system_key` file.

#### Features
* Added `system_key` parameter to the `elasticsearch` class and `elasticsearch::instance` type for placing Shield system keys.

#### Bugfixes
* Fixed systemd elasticsearch.service unit masking to use systemctl rather than raw symlinking to avoid puppet file backup errors.
* Fixed a couple of cases that broke compatability with older versions of puppet (elasticsearch_template types on puppet versions prior to 3.6 and yumrepo parameters on puppet versions prior to 3.5.1)
* Fixed issues that caused templates to be incorrectly detected as out-of-sync and thus always changed on each puppet run.
* Resources are now explicitly ordered to ensure behavior such as plugins being installed before instance start, users managed before templates changed, etc.

#### Changes
* Updated repository gpg fingerprint key to long form to silence module warnings.

#### Testing changes

## 0.13.0 (August 1, 2016)

### Summary
Rewritten elasticsearch::template using native type and provider.
Fixed and added additional proxy parameters to elasticsearch::plugin instances.
Exposed repo priority parameters for apt and yum repos.

#### Features
* In addition to better consistency, the `elasticsearch::template` type now also accepts various `api_*` parameters to control how access to the Elasticsearch API is configured (there are top-level parameters that are inherited and can be overwritten in `elasticsearch::api_*`).
* The `elasticsearch::config` parameter now supports deep hiera merging.
* Added the `elasticsearch::repo_priority` parameter to support apt and yum repository priority configuration.
* Added `proxy_username` and `proxy_password` parameters to `elasticsearch::plugin`.

#### Bugfixes
* Content of templates should now properly trigger new API PUT requests when the index template stored in Elasticsearch differs from the template defined in puppet.
* Installing plugins with proxy parameters now works correctly due to changed Java property flags.
* The `elasticsearch::plugin::module_dir` parameter has been re-implemented to aid in working around plugins with non-standard plugin directories.

#### Changes
* The `file` parameter on the `elasticsearch::template` defined type has been deprecated to be consistent with usage of the `source` parameter for other types.

#### Testing changes

## 0.12.0 (July 20, 2016)

IMPORTANT! A bug was fixed that mistakenly added /var/lib to the list of DATA_DIR paths on Debian-based systems.  This release removes that environment variable, which could potentially change path.data directories for instances of Elasticsearch.  Take proper precautions when upgrading to avoid unexpected downtime or data loss (test module upgrades, et cetera).

### Summary
Rewritten yaml generator, code cleanup, and various bugfixes. Configuration file yaml no longer nested. Service no longer restarts by default, and exposes more granular restart options.

#### Features
* The additional parameters restart_config_change, restart_package_change, and restart_plugin_change have been added for more granular control over service restarts.

#### Bugfixes
* Special yaml cases such as arrays of hashes and strings like "::" are properly supported.
* Previous Debian SysV init scripts mistakenly set the `DATA_DIR` environment variable to a non-default value.
* Some plugins failed installation due to capitalization munging, the elasticsearch_plugin provider no longer forces downcasing.

#### Changes
* The `install_options` parameter on the `elasticsearch::plugin` type has been removed. This was an undocumented parameter that often caused problems for users.
* The `elasticsearch.service` systemd unit is no longer removed but masked by default, effectively hiding it from systemd but retaining the upstream vendor unit on disk for package management consistency.
* `restart_on_change` now defaults to false to reduce unexpected cluster downtime (can be set to true if desired).
* Package pinning is now contained within a separate class, so users can opt to manage package repositories manually and still use this module's pinning feature.
* All configuration hashes are now flattened into dot-notated yaml in the elasticsearch configuration file. This should be fairly transparent in terms of behavior, though the config file formatting will change.

#### Testing changes
* The acceptance test suite has been dramatically slimmed to cut down on testing time and reduce false positives.

## 0.11.0 ( May 23, 2016 )

### Summary
Shield support, SLES support, and overhauled testing setup.

#### Features
* Support for shield
  * TLS Certificate management
  * Users (role and password management for file-based realms)
  * Roles (file-based with mapping support)
* Support (repository proxies)[https://github.com/elastic/puppet-elasticsearch/pull/615]
* Support for (SSL auth on API calls)[https://github.com/elastic/puppet-elasticsearch/pull/577]

#### Bugfixes
* (Fix Facter calls)[https://github.com/elastic/puppet-elasticsearch/pull/590] in custom providers

#### Changes

#### Testing changes
* Overhaul testing methodology, see CONTRIBUTING for updates
* Add SLES 12, Oracle 6, and PE 2016.1.1 to testing matrix
* Enforce strict variable checking

#### Known bugs
* This is the first release with Shield support, some untested edge cases may exist


##0.10.3 ( Feb 08, 2016 )

###Summary
Adding support for OpenBSD and minor fixes

####Features
* Add required changes to work with ES 2.2.x plugins
* Support for custom log directory
* Support for OpenBSD

####Bugfixes
* Add correct relation to file resource and plugin installation
* Notify service when upgrading the package

####Changes
* Remove plugin dir when upgrading Elasticsearch

####Testing changes

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name


##0.10.2 ( Jan 19, 2016 )

###Summary
Bugfix release and adding Gentoo support

####Features
* Added Gentoo support

####Bugfixes
* Create init script when set to unmanaged
* init_template variable was not passed on correctly to other classes / defines
* Fix issue with plugin type that caused run to stall
* Export ES_GC_LOG_FILE in init scripts

####Changes
* Improve documentation about init_defaults
* Update common files
* Removed recurse option on data directory management
* Add retry functionality to plugin type

####Testing changes

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name


##0.10.1 ( Dec 17, 2015 )

###Summary
Bugfix release for proxy functionality in plugin installation

####Features

####Bugfixes
* Proxy settings were not passed on correctly

####Changes
* Cleanup .pmtignore to exclude more files

####Testing changes

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name


##0.10.0 ( Dec 14, 2015 )

###Summary
Module now works with ES 2.x completely

####Features
* Work with ES 2.x new plugin system and remain to work with 1.x
* Implemented datacat module from Richard Clamp so other modules can hook into it for adding configuration options
* Fixed init and systemd files to work with 1.x and 2.x
* Made the module work with newer pl-apt module versions
* Export es_include so it is passed on to ES
* Ability to supply long gpg key for apt repo

####Bugfixes
* Documentation and typographical fixes
* Do not force puppet:/// schema resource
* Use package resource defaults rather than setting provider and source

####Changes

####Testing changes
* Improve unit testing and shorten the runtime

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name


##0.9.9 ( Sep 01, 2015 )

###Summary
Bugfix release and extra features

####Features
* Work with ES 2.x
* Add Java 8 detection in debian init script
* Improve offline plugin installation

####Bugfixes
* Fix a bug with new ruby versions but older puppet versions causing type error
* Fix config tempate to use correct ruby scoping
* Fix regex retrieving proxy port while downloading plugin
* Fix systemd template for better variable handling
* Template define was using wrong pathing for removal


####Changes

####Testing changes

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name


##0.9.8 ( Jul 07, 2015 )

###Summary


####Features
* Work with ES 2.x

####Bugfixes
* Fix plugin to maintain backwards compatibility

####Changes

####Testing changes
* ensure testing works with Puppet 4.x ( Rspec and Acceptance )

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name


##0.9.7 ( Jun 24, 2015 )

###Summary
This releases adds several important features and fixes an important plugin installation issue with ES 1.6 and higher.

####Features
* Automate plugin dir extraction
* use init service provider for Amazon Linux
* Add Puppetlabs/apt and ceritsc/yum as required modules
* Added Timeout to fetching facts in case ES does not respond
* Add proxy settings for package download

####Bugfixes
* Fixed systemd template to fix issue with LimitMEMLOCK setting
* Improve package version handling when specifying a version
* Add tmpfiles.d file to manage sub dir in /var/run path
* Fix plugin installations for ES 1.6 and higher

####Changes
* Removed Modulefile, only maintaining metadata.json file

####Testing changes
* Added unit testing for package pinning feature
* Added integration testing with Elasticsearch to find issues earlier
* Fix OpenSuse 13 testing

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name


##0.9.6 ( May 28, 2015 )

###Summary
Bugfix release 0.9.6

####Features
* Implemented package version pinning to avoid accidental upgrading
* Added support for Debian 8
* Added support for upgrading plugins
* Managing LimitNOFILE and LimitMEMLOCK settings in systemd

####Bugfixes

####Changes
* Dropped official support for PE 3.1.x and 3.2.x

####Testing changes
* Several testing changes implemented to increase coverage

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name


##0.9.5( Apr 16, 2015 )

###Summary
Bugfix release 0.9.5

We reverted the change that implemented the full 40 character for the apt repo key.
This caused issues with some older versions of the puppetlabs-apt module

####Features

####Bugfixes
* Revert using the full 40 character for the apt repo key.

####Changes

####Testing changes

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name


##0.9.4( Apr 14, 2015 )

###Summary
Bugfix release 0.9.4

####Features
* Add the ability to create and populate scripts

####Bugfixes
* add support for init_defaults_file to elasticsearch::instance
* Update apt key to full 40characters

####Changes
* Fix readme regarding module_dir with plugins

####Testing changes
* Adding staged removal test
* Convert git urls to https
* Add centos7 node config

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name


##0.9.3( Mar 24, 2015 )

###Summary
Bugfix release 0.9.3

####Features

####Bugfixes
* Not setting repo_version did not give the correct error
* Systemd file did not contain User/Group values

####Changes
* Brand rename from Elasticsearch to Elastic

####Testing changes
* Moved from multiple Gemfiles to single Gemfile

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name

##0.9.2( Mar 06, 2015 )

###Summary
Bugfix release 0.9.2

####Features
* Introducing es_instance_conn_validator resource to verify instance availability

####Bugfixes
* Fix missing data path when using the path config setting but not setting the data path

####Changes
None

####Testing changes
None

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name

##0.9.1 ( Feb 23, 2015 )

###Summary
This is the first bug fix release for 0.9 version.
A bug was reported with the recursive file management.

####Features
None

####Bugfixes
* Fix recursive file management
* Set undefined variables to work with strict_variables

####Changes
None

####Testing changes
None

####Known bugs
* Possible package conflicts when using ruby/python defines with main package name

##0.9.0 ( Feb 02, 2015 )

###Summary
This release is the first one towards 1.0 release.
Our planning is to provide LTS releases with the puppet module

####Features
* Support for using hiera to define instances and plugins.
* Support for OpenSuSE 13.x
* Custom facts about the installed Elasticsearch instance(s)
* Proxy host/port support for the plugin installation
* Ability to supply a custom logging.yml template

####Bugfixes
* Ensure file owners are correct accross all related files
* Fix of possible service name conflict
* Empty main config would fail with instances
* Removal of standard files from packages we dont use
* Ensuring correct sequence of plugin and template defines
* Added ES_CLASSPATH export to init scripts

####Changes
* Java installation to use puppetlabs-java module
* Added Support and testing for Puppet 3.7 and PE 3.7
* Improve metadata.json based on scoring from Forge


####Testing changes
* Added testing against Puppet 3.7 and PE 3.7
* Using rspec3
* Using rspec-puppet-facts gem simplifies rspec testing

####Known Bugs
* Possible package conflicts when using ruby/python defines with main package name

##0.4.0 ( Jun 18, 2014 ) - Backwards compatible breaking release

###Summary
This release introduces instances to facilitate the option to have more then a single instance running on the host system.

####Features
* Rewrite module to incorperate multi instance support
* New readme layout

####Bugfixes
* None

####Changes
* Adding ec2-linux osfamily for repo management
* Retry behaviour for plugin installation

####Testing changes
* Adding Puppet 3.6.x testing
* Ubuntu 14.04 testing
* Using new docker images
* Pin rspec to 2.14.x

####Known Bugs
* No known bugs

##0.3.2 ( May 15, 2014 )
*  Add support for SLC/Scientific Linux CERN ( PR #121 )
*  Add support for custom package names ( PR #122 )
*  Fix python and ruby client defines to avoid name clashes.
*  Add ability to use stage instead of anchor for repo class
*  Minor fixes to system tests

##0.3.1 ( April 22, 2014 )
*  Ensure we create the plugin directory before installing plugins
*  Added Puppet 3.5.x to rspec and system tests

##0.3.0 ( April 2, 2014 )
*  Fix minor issue with yumrepo in repo class ( PR #92 )
*  Implement OpenSuse support
*  Implement Junit reporting for tests
*  Adding more system tests and convert to Docker images
*  Use Augeas for managing the defaults file
*  Add retry to package download exec
*  Add management to manage the logging.yml file
*  Improve inline documentation
*  Improve support for Debian 6
*  Improve augeas for values with spaces
*  Run plugin install as ES user ( PR #108 )
*  Fix rights for the plugin directory
*  Pin Rake for Ruby 1.8.7
*  Adding new metadata for Forge.
*  Increase time for retry to insert the template

##0.2.4 ( Feb 21, 2014 )
*  Set puppetlabs-stdlib dependency version from 3.0.0 to 3.2.0 to be inline with other modules
*  Let puppet run fail when template insert fails
*  Documentation improvements ( PR #77, #78, #83 )
*  Added beaker system tests
*  Fixed template define after failing system tests
*  Some fixes so variables are more inline with intended structure

##0.2.3 ( Feb 06, 2014 )
*  Add repository management feature
*  Improve testing coverage and implement basic resource coverage reporting
*  Add puppet 3.4.x testing
*  Fix dependency in template define ( PR #72 )
*  For apt repo change from key server to key file

##0.2.2 ( Jan 23, 2014 )
*  Ensure exec names are unique. This caused issues when using our logstash module
*  Add spec tests for plugin define

##0.2.1 ( Jan 22, 2014 )
*  Simplify the management of the defaults file ( PR #64 )
*  Doc improvements for the plugin define ( PR #66 )
*  Allow creation of data directory ( PR #68 )
*  Fail early when package version and package_url are defined

##0.2.0 ( Nov 19, 2013 )
*  Large rewrite of the entire module described below
*  Make the core more dynamic for different service providers and multi instance capable
*  Add better testing and devided into different files
*  Fix template function. Replace of template is now only done when the file is changed
*  Add different ways to install the package except from the repository ( puppet/http/https/ftp/file )
*  Update java class to install openjdk 1.7
*  Add tests for python function
*  Update config file template to fix scoping issue ( from PR #57 )
*  Add validation of templates
*  Small changes for preperation for system tests
*  Update readme for new functionality
*  Added more test scenario's
*  Added puppet parser validate task for added checking
*  Ensure we don't add stuff when removing the module
*  Update python client define
*  Add ruby client define
*  Add tests for ruby clients and update python client tests

##0.1.3 ( Sep 06, 2013 )
*  Exec path settings has been updated to fix warnings ( PR #37, #47 )
*  Adding define to install python bindings ( PR #43 )
*  Scope deprecation fixes ( PR #41 )
*  feature to install plugins ( PR #40 )

##0.1.2 ( Jun 21, 2013 )
*  Update rake file to ignore the param inherit
*  Added missing documentation to the template define
*  Fix for template define to allow multiple templates ( PR #36 by Bruce Morrison )

##0.1.1 ( Jun 14, 2013 )
*  Add Oracle Linux to the OS list ( PR #25 by Stas Alekseev )
*  Respect the restart_on_change on the defaults ( PR #29 by Simon Effenberg )
*  Make sure the config can be empty as advertised in the readme
*  Remove dependency cycle when the defaults file is updated ( PR #31 by Bruce Morrison )
*  Enable retry on the template insert in case ES isn't started yet ( PR #32 by Bruce Morrison )
*  Update templates to avoid deprecation notice with Puppet 3.2.x
*  Update template define to avoid auto insert issue with ES
*  Update spec tests to reflect changes to template define

##0.1.0 ( May 09, 2013 )
*  Populate .gitignore ( PR #19 by Igor Galić )
*  Add ability to install initfile ( PR #20 by Justin Lambert )
*  Add ability to manage default file service parameters ( PR #21 by Mathieu Bornoz )
*  Providing complete containment of the module ( PR #24 by Brian Lalor )
*  Add ability to specify package version ( PR #25 by Justin Lambert )
*  Adding license file

##0.0.7 ( Mar 23, 2013 )
*  Ensure config directory is created and managed ( PR #13 by Martin Seener )
*  Dont backup package if it changes
*  Create explicit dependency on template directory ( PR #16 by Igor Galić )
*  Make the config directory variable ( PR #17 by Igor Galić and PR #18 by Vincent Janelle )
*  Fixing template define

##0.0.6 ( Mar 05, 2013 )
*  Fixing issue with configuration not printing out arrays
*  New feature to write the config hash shorter
*  Updated readme to reflect the new feature
*  Adding spec tests for config file generation

##0.0.5 ( Mar 03, 2013 )
*  Option to disable restart on config file change ( PR #10 by Chris Boulton )

##0.0.4 ( Mar 02, 2013 )
*  Fixed a major issue with the config template ( Issue #9 )

##0.0.3 ( Mar 02, 2013 )
*  Adding spec tests
*  Fixed init issue on Ubuntu ( Issue #6 by Marcus Furlong )
*  Fixed config template problem ( Issue #8 by surfchris )
*  New feature to manage templates

##0.0.2 ( Feb 16, 2013 )
*  Feature to supply a package instead of being dependent on the repository
*  Feature to install java in case one doesn't manage it externally
*  Adding RedHat and Amazon as Operating systems
*  fixed a typo - its a shard not a shared :) ( PR #5 by Martin Seener )

##0.0.1 ( Jan 13, 2013 )
*  Initial release of the module
