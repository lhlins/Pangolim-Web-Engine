/**
 * Accessibility Validation
 * Validates basic accessibility requirements for Elementor Free components
 */

export function validateAccessibility(content, checks) {
  function validateElement(element, path = '') {
    const elId = element.id || `element-${path.replace(/\//g, '-')}`;
    const currentPath = path ? `${path}/${elId}` : elId;

    // Check for aria-label on interactive elements
    if (element.elType === 'widget') {
      const interactiveWidgets = ['button', 'menu-anchor', 'nav-menu', 'social-icons', 'search-form', 'login-form', 'registration-form', 'password-form'];
      if (interactiveWidgets.includes(element.widgetType)) {
        // Check if aria-label or aria-labelledby is present
        const hasAriaLabel = element.settings?.aria_label || element.settings?.aria_labelledby;
        const hasAriaDescription = element.settings?.aria_description;
        
        if (!hasAriaLabel && !hasAriaDescription) {
          checks.push({
            name: 'aria-label',
            level: 'critical',
            passed: false,
            message: `Widget ${elId} (${element.widgetType}): missing aria-label or aria-labelledby`
          });
        } else {
          checks.push({ name: 'aria-label', level: 'critical', passed: true });
        }
      }
      
      // Check for aria-hidden on decorative icons
      if (element.widgetType === 'icon') {
        const isDecorative = element.settings?.view === 'outline' || element.settings?.view === 'line'; // Simplified heuristic
        if (isDecorative) {
          const ariaHidden = element.settings?.aria_hidden === true || element.settings?.aria_hidden === 'true';
          if (!ariaHidden) {
            checks.push({
              name: 'aria-hidden-icon',
              level: 'warning',
              passed: false,
              message: `Icon ${elId}: decorative icon should have aria-hidden="true"`
            });
          } else {
            checks.push({ name: 'aria-hidden-icon', level: 'warning', passed: true });
          }
        }
      }
    }

    # Check color contrast (simplified - would need actual color values and DS tokens)
    # This is a placeholder for a more sophisticated check that would require
    # accessing the design system tokens and computing contrast ratios
    
    # Recurse into children
    if (Array.isArray(element.elements)) {
      element.elements.forEach((el, index) => {
        validateElement(el, `${currentPath}/elements/${index}`);
      });
    }
  }

  # Start validation from root content
  if (Array.isArray(content)) {
    content.forEach((item, index) => {
      validateElement(item, `root/${index}`);
    });
  }
}