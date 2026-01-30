// Main plugin code that runs in Figma's sandbox

// Load settings from client storage
async function loadSettings(): Promise<string> {
  const baseUrl = await figma.clientStorage.getAsync('storybookBaseUrl');
  return baseUrl || 'https://design.reap.global/';
}

// Save settings to client storage
async function saveSettings(baseUrl: string): Promise<void> {
  await figma.clientStorage.setAsync('storybookBaseUrl', baseUrl);
}

// Parse component name from full Figma name
function parseComponentName(fullName: string): string {
  // Split by / and take last segment
  const segments = fullName.split('/');
  let name = segments[segments.length - 1];

  // Convert to lowercase for search
  name = name.toLowerCase();

  // Handle camelCase -> separate words
  // "IconButton" -> "icon button"
  name = name.replace(/([A-Z])/g, ' $1').trim().toLowerCase();

  return name;
}

// Get component name from selected node
function getComponentName(node: SceneNode): string | null {
  // Check if it's a component instance
  if (node.type === 'INSTANCE') {
    const componentNode = node.mainComponent;
    if (componentNode) {
      return componentNode.name;
    }
  }

  // Check if it's a component itself
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    return node.name;
  }

  // Check if parent is a component (for nested selections)
  let parent = node.parent;
  while (parent && parent.type !== 'PAGE') {
    if (parent.type === 'INSTANCE') {
      const componentNode = parent.mainComponent;
      if (componentNode) {
        return componentNode.name;
      }
    }
    if (parent.type === 'COMPONENT' || parent.type === 'COMPONENT_SET') {
      return parent.name;
    }
    parent = parent.parent;
  }

  return null;
}

// Handle selection changes
async function handleSelectionChange() {
  const selection = figma.currentPage.selection;
  const storybookBaseUrl = await loadSettings();

  if (selection.length === 0) {
    // No selection
    figma.ui.postMessage({
      type: 'selection-change',
      componentName: null,
      storybookBaseUrl
    });
    return;
  }

  // Get the first selected node
  const node = selection[0];
  const componentName = getComponentName(node);

  if (componentName) {
    const parsedName = parseComponentName(componentName);
    figma.ui.postMessage({
      type: 'selection-change',
      componentName: parsedName,
      fullComponentName: componentName,
      storybookBaseUrl
    });
  } else {
    // Selected node is not a component
    figma.ui.postMessage({
      type: 'selection-change',
      componentName: null,
      storybookBaseUrl
    });
  }
}

// Initialize plugin
async function init() {
  // Show UI
  figma.showUI(__html__, {
    width: 400,
    height: 600,
    title: 'Storybook Inspector'
  });

  // Load settings and send to UI
  const storybookBaseUrl = await loadSettings();
  figma.ui.postMessage({
    type: 'settings-loaded',
    storybookBaseUrl
  });

  // Handle initial selection
  await handleSelectionChange();

  // Listen for selection changes
  figma.on('selectionchange', handleSelectionChange);

  // Listen for messages from UI
  figma.ui.onmessage = async (msg) => {
    if (msg.type === 'save-settings') {
      await saveSettings(msg.storybookBaseUrl);
      figma.ui.postMessage({
        type: 'settings-saved',
        storybookBaseUrl: msg.storybookBaseUrl
      });
    } else if (msg.type === 'refresh-selection') {
      await handleSelectionChange();
    }
  };
}

// Start the plugin
init();
