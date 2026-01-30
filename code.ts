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

// Helper function to find component instances in children (recursive)
function findComponentInstance(node: BaseNode): ComponentNode | null {
  // Check if this node is a component instance
  if (node.type === 'INSTANCE' && node.mainComponent) {
    return node.mainComponent;
  }

  // Check if this node is a component itself
  if (node.type === 'COMPONENT') {
    return node;
  }

  // If this node can have children, search through them
  if ('children' in node && node.children) {
    for (const child of node.children) {
      const found = findComponentInstance(child);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

// Get component name from selected node
// Returns an object with the name and whether it's a component
function getComponentName(node: SceneNode): { name: string; isComponent: boolean } | null {
  // Priority 1: Check if the selected node itself is a component instance
  if (node.type === 'INSTANCE') {
    const componentNode = node.mainComponent;
    if (componentNode) {
      return { name: componentNode.name, isComponent: true };
    }
  }

  // Priority 2: Check if it's a component definition itself
  if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
    return { name: node.name, isComponent: true };
  }

  // Priority 3: If it's a layer inside a component, walk up to find the component
  let parent = node.parent;
  while (parent && parent.type !== 'PAGE') {
    if (parent.type === 'INSTANCE') {
      const componentNode = parent.mainComponent;
      if (componentNode) {
        return { name: componentNode.name, isComponent: true };
      }
    }
    if (parent.type === 'COMPONENT' || parent.type === 'COMPONENT_SET') {
      return { name: parent.name, isComponent: true };
    }
    parent = parent.parent;
  }

  // Priority 4: If it's a frame/group, check if it contains component instances
  if ('children' in node && node.children && node.children.length > 0) {
    const componentNode = findComponentInstance(node);
    if (componentNode) {
      return { name: componentNode.name, isComponent: true };
    }
  }

  // Priority 5: Use the layer's own name as fallback
  if ('name' in node && node.name) {
    return { name: node.name, isComponent: false };
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
  const result = getComponentName(node);

  if (result) {
    const parsedName = parseComponentName(result.name);
    figma.ui.postMessage({
      type: 'selection-change',
      componentName: parsedName,
      fullComponentName: result.name,
      isComponent: result.isComponent,
      storybookBaseUrl
    });
  } else {
    // Selected node has no name
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
