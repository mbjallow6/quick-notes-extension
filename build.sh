#!/bin/bash

# Build script for Quick Notes Extension

echo "Building Quick Notes Extension..."

# Create build directory
mkdir -p build

# Copy source files
cp -r src/* build/

# Remove test files from build
rm -rf build/tests

# Create ZIP for distribution
cd build
zip -r ../quick-notes-extension.zip .
cd ..

echo "Build complete! Extension packaged as quick-notes-extension.zip"
