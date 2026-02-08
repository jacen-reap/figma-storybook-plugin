# Storybook Inspector - Figma Plugin

A Figma plugin that provides direct links to Storybook components when developers inspect designs. This plugin bridges the gap between design and development by automatically linking Figma components to their corresponding Storybook stories.

## Features

- **Dev Mode Support**: Fully compatible with Figma's Dev Mode for developer inspection workflows
- **Universal Layer Detection**: Works with any selected layer - components, instances, frames, groups, or any named element
- **Smart Component Matching**: Intelligent search algorithm that prioritizes component name matches over descriptions
- **Smart Name Parsing**: Intelligently parses layer names (handles nested paths like "Elements/Button" and camelCase)
- **Storybook Index Integration**: Directly searches Storybook's index for accurate component matching
- **Embedded Preview**: Shows Storybook component preview in an embedded iframe (560px wide for better visibility)
- **Configurable Base URL**: Set your own Storybook instance URL
- **Persistent Settings**: Settings are saved and persist across Figma sessions
- **Optimized Performance**: 5-minute cache for Storybook index to minimize network requests

## Installation

### Development Mode

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the plugin:
   ```bash
   npm run build
   ```

4. Load the plugin in Figma:
   - Open Figma
   - Go to **Plugins** → **Development** → **Import plugin from manifest**
   - Select the `manifest.json` file from this directory

### Using the Plugin

#### In Design Mode
1. Run the plugin from **Plugins** → **Development** → **Storybook Inspector**
2. Select any layer in your Figma file (component, frame, group, text, etc.)
3. The plugin will automatically search and display the matching Storybook component

#### In Dev Mode
1. Switch to **Dev Mode** in Figma (developer inspection mode)
2. Run the plugin from **Plugins** → **Storybook Inspector**
3. Select any layer to inspect its corresponding Storybook component
4. The plugin will:
   - Search Storybook's index for matching components
   - Display the component name and match confidence
   - Show a direct link to open in Storybook
   - Display an embedded preview of the Storybook component
   - Indicate whether the selection is a component or a regular layer

**Note:** The plugin now features intelligent component matching that prioritizes exact component name matches over partial description matches, ensuring you get the most relevant Storybook component.

## Configuration

### Setting Your Storybook URL

1. Click the settings button (⚙️) in the plugin header
2. Enter your Storybook base URL (e.g., `https://design.reap.global/`)
3. Click **Save**

The default URL is set to `https://design.reap.global/`

### How Layer Names Are Parsed

The plugin intelligently extracts and formats layer names for Storybook search:

- **Nested paths**: `Elements/Button` → searches for "button"
- **PascalCase**: `IconButton` → searches for "icon button"
- **Simple names**: `Button` → searches for "button"

The plugin first checks if the selected layer is part of a component. If it is, it uses the component name. Otherwise, it uses the layer's own name. This means you can select any named element in Figma (frames, groups, text layers, etc.) and search for it in Storybook.

## How It Works

1. **Layer Detection**: The plugin listens for selection changes in Figma
2. **Name Extraction**: When you select any layer, it extracts the name:
   - If it's a component or component instance, uses the component name
   - Otherwise, uses the layer's own name (frame, group, text, etc.)
3. **URL Generation**: Creates a Storybook search URL like `https://your-storybook.com/?search=layername`
4. **Display**: Shows the link and loads the search results in an iframe

## Development

### Build Commands

- **Build once**: `npm run build`
- **Watch mode**: `npm run watch` (auto-rebuilds on file changes)

### Project Structure

```
figma-plugin/
├── manifest.json          # Plugin configuration
├── code.ts               # Main plugin logic (Figma sandbox)
├── ui.html               # Plugin user interface
├── code.js               # Compiled output (git-ignored)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Troubleshooting

### Plugin doesn't open in Dev Mode

- Ensure you're using the latest version with Dev Mode support
- Check that the manifest includes `"capabilities": ["inspect", "vscode"]`
- Verify `"editorType"` includes `"dev"` in the manifest.json
- Reload the plugin after making any manifest changes

### "Browser does not support required crypto APIs" error

This error has been fixed in the latest version by removing restrictive iframe sandbox attributes. If you still see this error:
- Make sure you're using the latest version of the plugin
- The iframe no longer has sandbox restrictions, allowing Cloudflare verification to work
- Rebuild the plugin with `npm run build` if you made any changes

### Plugin doesn't show Storybook preview

- Check that your Storybook URL is correct in settings
- Ensure the Storybook URL is accessible from your browser
- Check that the `networkAccess` domain in `manifest.json` matches your Storybook domain
- Verify your Storybook has an accessible `/index.json` or `/stories.json` endpoint

### Wrong component showing in preview

The plugin uses an intelligent matching algorithm:
- It prioritizes exact component name matches over partial description matches
- Component names are extracted from the last segment of the title path
- If you're not seeing the right component, check that the layer name matches the Storybook component name

### Layer name not showing

- Make sure the selected layer has a name
- The plugin works with any named element: components, instances, frames, groups, shapes, text layers, etc.
- If the layer is inside a component, it will use the component name instead
- Unnamed layers will show the empty state message

### Settings not persisting

- Settings are stored using Figma's `clientStorage` API
- If settings reset, try saving them again
- Check the browser console for any errors

## Network Access

The plugin requires network access to load Storybook in the iframe. The default allowed domain is `https://design.reap.global`.

To use a different Storybook URL:
1. Update the `networkAccess.allowedDomains` in `manifest.json`
2. Rebuild the plugin with `npm run build`
3. Reload the plugin in Figma

## Technical Details

### Dev Mode Support
The plugin is configured with:
- `"editorType": ["figma", "dev"]` - Enables the plugin in both Design and Dev modes
- `"capabilities": ["inspect", "vscode"]` - Required capabilities for Dev mode inspection
- Read-only access in Dev mode (can read document, modify metadata, make network requests)

**Note:** The plugin does not support FigJam as Dev mode and FigJam editor types cannot coexist in the same plugin.

### Recent Improvements
- **v1.3.0** (2026-02-06)
  - Added full Dev Mode support with proper capabilities configuration
  - Fixed crypto API errors by removing restrictive iframe sandbox
  - Increased plugin width from 400px to 560px (40% wider) for better component preview
  - Improved component matching algorithm to prioritize component names
  - Added Storybook index caching (5-minute TTL) for better performance

### Plugin Dimensions
- Width: 560px (optimized for developer preview)
- Height: 600px
- Resizable: No (fixed dimensions for consistent UX)

## Changelog

### v1.3.0 (2026-02-06)
- ✨ **NEW**: Full Dev Mode support with proper capabilities configuration
- 🐛 **FIX**: Resolved "Browser does not support required crypto APIs" error
- 💄 **UI**: Increased plugin width from 400px to 560px for better preview
- ⚡ **PERF**: Improved component matching to prioritize component names
- ⚡ **PERF**: Added 5-minute cache for Storybook index
- 🔧 **CONFIG**: Removed FigJam support (conflicts with Dev mode)
- 🔧 **CONFIG**: Added required inspect and vscode capabilities

### v1.2.0 (Previous)
- Improved component matching algorithm
- Fixed Storybook URL generation with correct path types
- Fixed iframe focus conflicts

### v1.1.0 (Previous)
- Initial release with universal layer detection
- Smart name parsing and Storybook integration
- Configurable base URL with persistent settings

## License

MIT

## Support

For issues, questions, or contributions, please open an issue in the repository.

## Credits

Built with ❤️ for developers bridging design and code.
