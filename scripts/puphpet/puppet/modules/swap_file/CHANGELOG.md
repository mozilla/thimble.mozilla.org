# Change Log

## [v3.0.0](https://github.com/petems/petems-swap_file/tree/v3.0.0) (2016-05-26)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v2.5.0...v3.0.0)

**Fixed bugs:**

- Updating the module to latest version will create additional fstab entries for the same swapfile [\#20](https://github.com/petems/petems-swap_file/issues/20)

**Merged pull requests:**

- Type and provider refactor [\#15](https://github.com/petems/petems-swap_file/pull/15) ([petems](https://github.com/petems))

## [v2.5.0](https://github.com/petems/petems-swap_file/tree/v2.5.0) (2016-05-24)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v2.4.1...v2.5.0)

**Merged pull requests:**

- Adds ability set swappiness with the module [\#62](https://github.com/petems/petems-swap_file/pull/62) ([petems](https://github.com/petems))

## [v2.4.1](https://github.com/petems/petems-swap_file/tree/v2.4.1) (2016-05-11)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v2.4.0...v2.4.1)

## [v2.4.0](https://github.com/petems/petems-swap_file/tree/v2.4.0) (2016-05-11)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v2.3.0...v2.4.0)

**Implemented enhancements:**

- Create workaround for stringify\_facts true [\#57](https://github.com/petems/petems-swap_file/issues/57)

**Fixed bugs:**

- Cannot change size of existing swap file [\#13](https://github.com/petems/petems-swap_file/issues/13)

**Merged pull requests:**

- Allows removing existing swap from a CSV fact [\#61](https://github.com/petems/petems-swap_file/pull/61) ([petems](https://github.com/petems))
- Add a swapfile fact as a CSV [\#60](https://github.com/petems/petems-swap_file/pull/60) ([petems](https://github.com/petems))

## [v2.3.0](https://github.com/petems/petems-swap_file/tree/v2.3.0) (2016-05-04)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v2.2.2...v2.3.0)

**Closed issues:**

- Update CHANGELOG with 2.2.2 changes [\#45](https://github.com/petems/petems-swap_file/issues/45)

**Merged pull requests:**

- Move coverage shim to spec\_helper [\#59](https://github.com/petems/petems-swap_file/pull/59) ([petems](https://github.com/petems))
- Update main class documentation [\#58](https://github.com/petems/petems-swap_file/pull/58) ([petems](https://github.com/petems))
- Add older listen gem for older Ruby versions [\#56](https://github.com/petems/petems-swap_file/pull/56) ([petems](https://github.com/petems))
- New feature: resizing existing swapfiles [\#55](https://github.com/petems/petems-swap_file/pull/55) ([petems](https://github.com/petems))
- Linting fixes in examples [\#54](https://github.com/petems/petems-swap_file/pull/54) ([petems](https://github.com/petems))
- Updates swap file fact to only show swap files [\#53](https://github.com/petems/petems-swap_file/pull/53) ([petems](https://github.com/petems))
- Make things a little less strict [\#52](https://github.com/petems/petems-swap_file/pull/52) ([petems](https://github.com/petems))
- Renaming sizes fact [\#51](https://github.com/petems/petems-swap_file/pull/51) ([petems](https://github.com/petems))
- Add contributing.json \(GitMagic\) [\#49](https://github.com/petems/petems-swap_file/pull/49) ([gitmagic-bot](https://github.com/gitmagic-bot))
- Update stdlib versions [\#48](https://github.com/petems/petems-swap_file/pull/48) ([petems](https://github.com/petems))
- Adding a fact to show you swap file sizes [\#47](https://github.com/petems/petems-swap_file/pull/47) ([petems](https://github.com/petems))

## [v2.2.2](https://github.com/petems/petems-swap_file/tree/v2.2.2) (2016-04-03)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v2.2.1...v2.2.2)

**Closed issues:**

- Created file size is incorrect [\#43](https://github.com/petems/petems-swap_file/issues/43)

**Merged pull requests:**

- Fixes MB size accuracy [\#44](https://github.com/petems/petems-swap_file/pull/44) ([petems](https://github.com/petems))

## [v2.2.1](https://github.com/petems/petems-swap_file/tree/v2.2.1) (2016-02-16)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v2.2.0...v2.2.1)

**Merged pull requests:**

- Move to petems-swap\_file [\#42](https://github.com/petems/petems-swap_file/pull/42) ([petems](https://github.com/petems))
- Make testing matrix a little simpler... [\#41](https://github.com/petems/petems-swap_file/pull/41) ([petems](https://github.com/petems))

## [v2.2.0](https://github.com/petems/petems-swap_file/tree/v2.2.0) (2016-02-15)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v2.1.0...v2.2.0)

**Closed issues:**

- Module should be tested on multiple Ruby and Puppet versions [\#38](https://github.com/petems/petems-swap_file/issues/38)
- Release version 2.1.0 on Puppet Forge [\#36](https://github.com/petems/petems-swap_file/issues/36)
- dd vs fallocate  [\#26](https://github.com/petems/petems-swap_file/issues/26)

**Merged pull requests:**

- Wrapper [\#40](https://github.com/petems/petems-swap_file/pull/40) ([Phil-Friderici](https://github.com/Phil-Friderici))
- Modernize Travis setup [\#39](https://github.com/petems/petems-swap_file/pull/39) ([Phil-Friderici](https://github.com/Phil-Friderici))
- Satisfy puppet-lint [\#37](https://github.com/petems/petems-swap_file/pull/37) ([Phil-Friderici](https://github.com/Phil-Friderici))

## [v2.1.0](https://github.com/petems/petems-swap_file/tree/v2.1.0) (2015-12-30)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v2.0.0...v2.1.0)

**Closed issues:**

- Missing 2.0.0 tag [\#24](https://github.com/petems/petems-swap_file/issues/24)

**Merged pull requests:**

- Adds `cmd` parameter. [\#35](https://github.com/petems/petems-swap_file/pull/35) ([petems](https://github.com/petems))
- Updating Beaker acceptance machines [\#34](https://github.com/petems/petems-swap_file/pull/34) ([petems](https://github.com/petems))
- Enable travis docker [\#32](https://github.com/petems/petems-swap_file/pull/32) ([petems](https://github.com/petems))
- Adds spec.opts file [\#31](https://github.com/petems/petems-swap_file/pull/31) ([petems](https://github.com/petems))
- Add cmd param [\#29](https://github.com/petems/petems-swap_file/pull/29) ([petems](https://github.com/petems))
- Added timeout parameter for exec when using dd [\#27](https://github.com/petems/petems-swap_file/pull/27) ([petems](https://github.com/petems))

## [v2.0.0](https://github.com/petems/petems-swap_file/tree/v2.0.0) (2015-07-27)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v1.1.1...v2.0.0)

**Closed issues:**

- swap\_file::files fails when you set the ensure attribute to absent [\#21](https://github.com/petems/petems-swap_file/issues/21)

**Merged pull requests:**

- Remove Class for Swap file [\#23](https://github.com/petems/petems-swap_file/pull/23) ([petems](https://github.com/petems))
- Fix: exec contains swapfile name when absent [\#22](https://github.com/petems/petems-swap_file/pull/22) ([juame](https://github.com/juame))
- Update README.markdown [\#18](https://github.com/petems/petems-swap_file/pull/18) ([yalcinsurkultay](https://github.com/yalcinsurkultay))

## [v1.1.1](https://github.com/petems/petems-swap_file/tree/v1.1.1) (2015-03-17)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v1.1.0...v1.1.1)

**Closed issues:**

- mount resource should be unique [\#14](https://github.com/petems/petems-swap_file/issues/14)

**Merged pull requests:**

- Add defined type for swap and give unique names [\#16](https://github.com/petems/petems-swap_file/pull/16) ([petems](https://github.com/petems))

## [v1.1.0](https://github.com/petems/petems-swap_file/tree/v1.1.0) (2015-03-17)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v1.0.1...v1.1.0)

## [v1.0.1](https://github.com/petems/petems-swap_file/tree/v1.0.1) (2015-01-17)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v1.0.0...v1.0.1)

**Closed issues:**

- Not issue, ask a question [\#11](https://github.com/petems/petems-swap_file/issues/11)
- missed "default" in fstab [\#5](https://github.com/petems/petems-swap_file/issues/5)
- Docker Beaker tests always fail [\#4](https://github.com/petems/petems-swap_file/issues/4)

**Merged pull requests:**

- Fix License code [\#12](https://github.com/petems/petems-swap_file/pull/12) ([petems](https://github.com/petems))
- Add FreeBSD tests [\#10](https://github.com/petems/petems-swap_file/pull/10) ([petems](https://github.com/petems))
- Swap fstab settings [\#8](https://github.com/petems/petems-swap_file/pull/8) ([petems](https://github.com/petems))
- Fixes to swapfile permissions and to implied OS support [\#7](https://github.com/petems/petems-swap_file/pull/7) ([mattock](https://github.com/mattock))

## [v1.0.0](https://github.com/petems/petems-swap_file/tree/v1.0.0) (2014-09-24)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v0.2.0...v1.0.0)

## [v0.2.0](https://github.com/petems/petems-swap_file/tree/v0.2.0) (2014-09-01)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v0.3.0...v0.2.0)

## [v0.3.0](https://github.com/petems/petems-swap_file/tree/v0.3.0) (2014-09-01)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/0.3.0...v0.3.0)

## [0.3.0](https://github.com/petems/petems-swap_file/tree/0.3.0) (2014-09-01)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/0.2.0...0.3.0)

## [0.2.0](https://github.com/petems/petems-swap_file/tree/0.2.0) (2014-08-22)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v0.1.2...0.2.0)

## [v0.1.2](https://github.com/petems/petems-swap_file/tree/v0.1.2) (2014-05-29)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v0.1.1...v0.1.2)

## [v0.1.1](https://github.com/petems/petems-swap_file/tree/v0.1.1) (2014-05-29)
[Full Changelog](https://github.com/petems/petems-swap_file/compare/v0.1.0...v0.1.1)

## [v0.1.0](https://github.com/petems/petems-swap_file/tree/v0.1.0) (2014-02-27)
**Merged pull requests:**

- Removing custom fact for memory size in bytes [\#1](https://github.com/petems/petems-swap_file/pull/1) ([petems](https://github.com/petems))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*
