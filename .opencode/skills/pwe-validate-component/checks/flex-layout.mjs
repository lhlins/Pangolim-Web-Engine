/**
 * Flex Layout Validation
 * Validates that container layouts using gap and percentage widths are mathematically sound
 * Formula: total = (N-1)*gap + N*columnWidth <= 100%
 * where gap is in same unit as columnWidth (usually %)
 */

export function validateFlexLayout(content, checks) {
  // Helper to convert CSS value to percentage number
  function toPercent(value) {
    if (typeof value !== 'string') return null;
    // Handle % values
    if (value.endsWith('%')) {
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    }
    // Handle px, rem, em, etc. - we cannot convert without context, so return null
    // For now, we only validate % values as they are the problematic ones for flex overflow
    return null;
  }

  function validateContainer(container, path = '') {
    const containerId = container.id || `container-${path.replace(/\//g, '-')}`;
    const currentPath = path ? `${path}/${containerId}` : containerId;

    // Check if this container uses flexbox layout (simplified check)
    const isFlex = container.settings?.justify_content !== undefined || 
                   container.settings?.align_items !== undefined ||
                   container.settings?.flex_direction !== undefined ||
                   container.settings?.display === 'flex';

    // If not flex, skip gap validation
    if (!isFlex) {
      // Still recurse into children
      if (Array.isArray(container.elements)) {
        container.elements.forEach((el, index) => {
          validateContainer(el, `${currentPath}/elements/${index}`);
        });
      }
      return;
    }

    // Get direct children that are containers or widgets (elements that take width)
    const layoutChildren = container.elements.filter(el => 
      el.elType === 'container' || el.elType === 'widget'
    );

    if (layoutChildren.length === 0) return;

    // Check for gap setting
    const gapValue = container.settings?.gap;
    if (!gapValue) {
      // No gap set, validation passes
      checks.push({ 
        name: 'flex-layout-gap', 
        level: 'critical', 
        passed: true, 
        message: `Container ${containerId}: gap not set (flex layout without gap)` 
      });
      // Still validate children
      if (Array.isArray(container.elements)) {
        container.elements.forEach((el, index) => {
          validateContainer(el, `${currentPath}/elements/${index}`);
        });
      }
      return;
    }

    // Convert gap to percentage (assuming gap is in % for now)
    const gapPercent = toPercent(gapValue);
    if (gapPercent === null) {
      // Gap is not in % - we cannot validate without knowing parent width
      checks.push({ 
        name: 'flex-layout-gap', 
        level: 'warning', 
        passed: true, 
        message: `Container ${containerId}: gap is '${gapValue}' (only % gap validated)` 
      });
      // Still validate children
      if (Array.isArray(container.elements)) {
        container.elements.forEach((el, index) => {
          validateContainer(el, `${currentPath}/elements/${index}`);
        });
      }
      return;
    }

    // Calculate total width used by children
    let totalPercent = 0;
    let validChildren = 0;

    layoutChildren.forEach(child => {
      const childWidth = child.settings?.width;
      if (childWidth && typeof childWidth === 'string') {
        const widthPercent = toPercent(childWidth);
        if (widthPercent !== null) {
          totalPercent += widthPercent;
          validChildren++;
        }
      }
    });

    // If we couldn't get widths for any children, skip validation
    if (validChildren === 0) {
      checks.push({ 
        name: 'flex-layout-calculation', 
        level: 'warning', 
        passed: true, 
        message: `Container ${containerId}: unable to calculate children widths (non-% or missing)` 
      });
      // Still validate children
      if (Array.isArray(container.elements)) {
        container.elements.forEach((el, index) => {
          validateContainer(el, `${currentPath}/elements/${index}`);
        });
      }
      return;
    }

    // Calculate expected total: (N-1)*gap + N*avgChildWidth
    // But we have sum of widths, so: total = sum(widths) + (N-1)*gap
    const N = validChildren;
    const expectedTotal = totalPercent + (N - 1) * gapPercent;

    const passes = expectedTotal <= 100 + 0.5; // Allow 0.5% tolerance for rounding

    checks.push({ 
      name: 'flex-layout-validation', 
      level: 'critical', 
      passed: passes, 
      message: passes 
        ? `Container ${containerId}: layout valid (${expectedTotal.toFixed(2)}% <= 100%)` 
        : `Container ${containerId}: layout overflow (${expectedTotal.toFixed(2)}% > 100%) - reduce gap or widths` 
    });

    // Recurse into all elements (including non-layout ones) for nested containers
    if (Array.isArray(container.elements)) {
      container.elements.forEach((el, index) => {
        validateContainer(el, `${currentPath}/elements/${index}`);
      });
    }
  }

  // Start validation from root content
  if (Array.isArray(content)) {
    content.forEach((item, index) => {
      validateContainer(item, `root/${index}`);
    });
  }
}