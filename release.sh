#!/bin/bash

# Release script for Quick Notes Extension

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 1.1.0"
    exit 1
fi

VERSION=$1

echo "Preparing release $VERSION..."

# Update version in manifest.json
sed -i "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" src/manifest.json

# Update version in popup.html
sed -i "s/v[0-9.]*<\/div>/v$VERSION<\/div>/" src/popup.html

# Run tests
./test-extension.sh

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Aborting release."
    exit 1
fi

# Build extension
./build.sh

# Commit version bump
git add .
git commit -m "Bump version to $VERSION"

# Create tag
git tag -a "v$VERSION" -m "Release version $VERSION"

# Push to GitHub
git push origin main
git push origin "v$VERSION"

echo "✅ Release $VERSION complete!"
