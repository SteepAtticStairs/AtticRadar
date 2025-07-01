#!/bin/bash

# Function to get file size in bytes
get_file_size() {
    wc -c < "$1"
}

# File paths
css_file="${0%/*}/../index.css"
js_file="${0%/*}/../dist/bundle.js"
output_file="${0%/*}/size.txt"

# Get file sizes
css_size=$(get_file_size "$css_file")
js_size=$(get_file_size "$js_file")

# Write sizes to output file
# echo "$(basename "$css_file") ${css_size}" > "$output_file"
# echo "$(basename "$js_file") ${js_size}" >> "$output_file"
echo "{ \"$(basename "$css_file")\": ${css_size}, \"$(basename "$js_file")\": ${js_size} }" > "$output_file"

echo "File sizes written to ${output_file}."