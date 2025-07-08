#!/bin/bash

echo "Testing Quick Notes Extension..."

# Check file structure
if [ ! -f "src/manifest.json" ]; then
    echo "❌ manifest.json missing"
    exit 1
fi

if [ ! -f "src/popup.html" ]; then
    echo "❌ popup.html missing"
    exit 1
fi

if [ ! -f "src/popup.js" ]; then
    echo "❌ popup.js missing"
    exit 1
fi

if [ ! -f "src/popup.css" ]; then
    echo "❌ popup.css missing"
    exit 1
fi

echo "✅ All core files present"

# Validate manifest.json
if ! python3 -m json.tool src/manifest.json > /dev/null 2>&1; then
    echo "❌ manifest.json is invalid JSON"
    exit 1
fi

echo "✅ manifest.json is valid"

# Check version consistency
MANIFEST_VERSION=$(grep '"version"' src/manifest.json | cut -d'"' -f4)
HTML_VERSION=$(grep 'class="version"' src/popup.html | sed 's/.*v\([0-9.]*\).*/\1/')

if [ "$MANIFEST_VERSION" != "$HTML_VERSION" ]; then
    echo "❌ Version mismatch: manifest($MANIFEST_VERSION) vs HTML($HTML_VERSION)"
    exit 1
fi

echo "✅ Version consistency check passed"
echo "✅ All tests passed!"
