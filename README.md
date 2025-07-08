# Quick Note Scratchpad Chrome Extension

A simple, elegant Chrome extension for quick notes and code snippets that persist across browser sessions.

## Features

- 📝 **Persistent Notes**: Your notes are automatically saved locally
- ⚡ **Auto-Save**: Notes save automatically as you type
- 🎨 **Clean Interface**: Minimalist design focused on productivity
- ⌨️ **Keyboard Shortcuts**: Ctrl+Shift+N to open, Ctrl+S to save
- 📊 **Character Counter**: Track your note length
- 🧹 **Clear Function**: Easy note clearing with confirmation

## Installation

### From Source (Development)

1. Clone this repository:
- git clone https://github.com/YOUR_USERNAME/quick-notes-extension.git
- cd quick-notes-extension

2. Load in Chrome:
- Open `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" and select the `src` folder

### From Chrome Web Store

*Coming soon!*

## Development

### Prerequisites

- Chrome browser
- Git
- Basic knowledge of HTML, CSS, JavaScript

### Run tests
- ./test-extension.sh

### Build extension
- ./build.sh

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `./test-extension.sh`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Workflow

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development workflow.

## Project Structure
quick-notes-extension/
├── src/
│ ├── manifest.json # Extension configuration
│ ├── popup.html # Main interface
│ ├── popup.css # Styling
│ ├── popup.js # Core functionality
│ └── icons/ # Extension icons
├── tests/ # Test files
├── docs/ # Documentation
└── build.sh # Build script

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 [Report bugs](https://github.com/YOUR_USERNAME/quick-notes-extension/issues)
- 💡 [Request features](https://github.com/YOUR_USERNAME/quick-notes-extension/issues)
- 📧 [Contact maintainer](mailto:your.email@example.com)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.