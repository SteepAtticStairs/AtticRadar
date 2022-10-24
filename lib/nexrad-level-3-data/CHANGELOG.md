# 0.6.0
- Changed all messages logged to console.warn(), or the matching custom logger if provided.

# v0.4.0
- Handle multiple packets per layer. The .radialPackets structure will now return layers that have multiple packets as an array (typically text) or a single object when there is only one packet.
# v0.3.0
## Breaking Changes
- Flatten graphic header to an array of packets and omit page and length values

# v0.2.0
## Breaking Changes
- Parsers no longer return delimeters, block lengths, or IDs as these are internally evaluated and checked during the parsing process