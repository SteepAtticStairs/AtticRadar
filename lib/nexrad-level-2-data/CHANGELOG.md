## 2.4.0
- Changed all messages logged to console.warn(), or the matching custom logger if provided.
## v2.3.0
- Made updates to handle changes between RPG version T (build 19.0) and U (Build 20.0, 21 July 2021). The lengths of some blocks did change, however this library only does rudimentary validation of data, block lengths and pointers and is not affected by these changes in the specification.
- Tested against actual data marked as Volume Data major version 3 (up from version 2)

## v2.2.0
- Added the ability to read archives before ~2008 when high resolution was implemented
- Added the ability to read gzip compressed archives, when the entire archive is gzip compressed