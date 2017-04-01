## Release 0.5.0
### Summary
A few new features in this release, including work around supporting default git config and accepting flat git config values. Also a couple of bugfixes and a small readme update.

#### Features
- Now accepts flat git config values
- Supports defaults for git config
- Added check for git package presence to define config::git

#### Bugfixes
- Adds missing ownership in git::subtree
- Now escapes git config values for shell execution
- Improved table of contents in readme

##2015-05-26 - Release 0.4.0
###Summary
This release adds greater flexibility to `git` and `git_config` and includes a couple of bug fixes, including fixing `git_config` with multiple users.

####Deprecations
- The `section` parameter in `git_config` and `git::config` has been deprecated. The full option name should be passed to the `key` parameter instead (i.e., "user.email")

####Features
- Refactored existing facts and added spec tests (MODULES-1571)
- Test and doc updates
- New parameters in class `git`:
  - `package_manage`
  - `package_ensure`
  - `configs`

####Bugfixes
- Only run if git is actually installed (MODULES-1238)
- Fix `git_config` to work with multiple users (MODULES-1863)

##2014-11-18 - Release 0.3.0
###Summary
This release primarily includes improvements to `git::config` and the addition of the `git_config` type&provider, along with much improved testing

####Features
- Add `user` and `scope` parameter to `git::config`
- Add `git_config` type
- Refactor `git::config` to use `git_config`
- Test improvements

####Bugfixes
- Redirect stderr to the correct place on windows

##2014-07-15 - Release 0.2.0
###Summary
This release updates metadata.json so the module can be uninstalled and
upgraded via the puppet module command.  It also lets you set the
`package_name`.

####Features
- Ability to set `package_name`

##2014-06-25 - Release 0.1.0
###Summary
This release adds git::subtree and git::config, as well as fixes up the
documentation and unit tests.

####Features
- README improvements.
- Add git::subtree class to install git-subtree.
- Add git::config resource

####Bugfixes
- Fix git_version fact.

##2011-06-03 - Release 0.0.1
- Initial commit
