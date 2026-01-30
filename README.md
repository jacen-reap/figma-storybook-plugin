# Storybook Inspector - Figma Plugin

A Figma plugin that provides direct links to Storybook components when developers inspect designs. This plugin bridges the gap between design and development by automatically linking Figma components to their corresponding Storybook stories.

## Features

- **Universal Layer Detection**: Works with any selected layer - components, instances, frames, groups, or any named element
- **Smart Name Parsing**: Intelligently parses layer names (handles nested paths like "Elements/Button" and camelCase)
- **Storybook Search Integration**: Uses Storybook's search functionality to find components by name
- **Embedded Preview**: Shows Storybook search results in an embedded iframe
- **Configurable Base URL**: Set your own Storybook instance URL
- **Persistent Settings**: Settings are saved and persist across Figma sessions

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

1. Run the plugin from **Plugins** → **Development** → **Storybook Inspector**
2. Select any layer in your Figma file (component, frame, group, text, etc.)
3. The plugin will:
   - Display the layer or component name
   - Show a direct link to open in Storybook
   - Display an embedded preview of the Storybook search results
   - Indicate whether the selection is a component or a regular layer

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

### Plugin doesn't show Storybook preview

- Check that your Storybook URL is correct in settings
- Ensure the Storybook URL is accessible from your browser
- Check that the `networkAccess` domain in `manifest.json` matches your Storybook domain

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

## License

MIT

## Support

For issues, questions, or contributions, please open an issue in the repository.
