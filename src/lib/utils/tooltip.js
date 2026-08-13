/**
 * Custom tooltip action to replace $lib/utils/tooltip.js.
 *
 * Usage: use:tooltip={{...tooltipConfig}} or use:tooltip
 * The tooltip content is read from the element's `title` attribute.
 * After initialization, the `title` attribute is removed to prevent
 * the browser's native tooltip from showing.
 *
 * @param {HTMLElement} node
 * @param {Object} [options]
 * @param {string} [options.animation='fade']
 * @param {number} [options.delay=0]
 * @param {Object} [options.style]
 * @param {string} [options.theme='']
 * @param {boolean} [options.autoPosition=true]
 */
export function tooltip(node, options = {}) {
    let tooltipEl = null;
    let showTimeout = null;
    let hideTimeout = null;
    let isVisible = false;

    const config = {
        animation: options.animation || 'fade',
        delay: options.delay ?? 0,
        style: {
            color: 'white',
            backgroundColor: 'rgba(92,0,166,0.9)',
            padding: '10px',
            borderRadius: '5px',
            ...(options.style || {}),
        },
        theme: options.theme || '',
        autoPosition: options.autoPosition !== false,
    };

    function getTitle() {
        return node.getAttribute('title') || node.getAttribute('alt') || '';
    }

    function createTooltip(text) {
        if (tooltipEl) return;

        tooltipEl = document.createElement('div');
        tooltipEl.textContent = text;
        tooltipEl.style.position = 'fixed';
        tooltipEl.style.color = config.style.color;
        tooltipEl.style.backgroundColor = config.style.backgroundColor;
        tooltipEl.style.padding = config.style.padding;
        tooltipEl.style.borderRadius = config.style.borderRadius;
        tooltipEl.style.fontSize = '0.875rem';
        tooltipEl.style.lineHeight = '1.25';
        tooltipEl.style.zIndex = '9999';
        tooltipEl.style.pointerEvents = 'none';
        tooltipEl.style.transition = 'opacity 0.15s ease';
        tooltipEl.style.opacity = '0';
        tooltipEl.style.maxWidth = '300px';
        tooltipEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        tooltipEl.style.whiteSpace = 'nowrap';

        if (config.theme) {
            config.theme.split(' ').forEach(cls => {
                if (cls) tooltipEl.classList.add(cls);
            });
        }

        document.body.appendChild(tooltipEl);
    }

    function positionTooltip() {
        if (!tooltipEl) return;

        const rect = node.getBoundingClientRect();
        const tooltipRect = tooltipEl.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Default: above the element, centered
        let top = rect.top - tooltipRect.height - 8;
        let left = rect.left + (rect.width - tooltipRect.width) / 2;

        // Prevent overflow on the right
        if (left + tooltipRect.width > viewportWidth - 8) {
            left = viewportWidth - tooltipRect.width - 8;
        }
        // Prevent overflow on the left
        if (left < 8) {
            left = 8;
        }

        // If above doesn't fit, place below
        if (top < 8) {
            top = rect.bottom + 8;
        }

        // If still doesn't fit, place at center of viewport
        if (top + tooltipRect.height > viewportHeight - 8) {
            top = rect.top - tooltipRect.height - 8;
            if (top < 8) {
                top = Math.max(8, (viewportHeight - tooltipRect.height) / 2);
            }
        }

        tooltipEl.style.top = top + 'px';
        tooltipEl.style.left = left + 'px';
    }

    function showTooltip() {
        const title = getTitle();
        if (!title) return;

        clearTimeout(hideTimeout);
        if (isVisible) return;

        showTimeout = setTimeout(() => {
            createTooltip(title);
            // Force reflow for transition
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (tooltipEl) {
                        tooltipEl.style.opacity = '1';
                        positionTooltip();
                    }
                });
            });
            isVisible = true;
        }, config.delay);
    }

    function hideTooltip() {
        clearTimeout(showTimeout);
        if (!isVisible) return;

        hideTimeout = setTimeout(() => {
            if (tooltipEl) {
                tooltipEl.style.opacity = '0';
                setTimeout(() => {
                    if (tooltipEl) {
                        tooltipEl.remove();
                        tooltipEl = null;
                    }
                }, 150);
            }
            isVisible = false;
        }, 50);
    }

    function handleMouseEnter() {
        showTooltip();
    }

    function handleMouseLeave() {
        hideTooltip();
    }

    function handleMouseMove() {
        if (isVisible && tooltipEl) {
            positionTooltip();
        }
    }

    // Remove the native title attribute so the browser tooltip doesn't show
    const savedTitle = node.getAttribute('title');

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);
    node.addEventListener('mousemove', handleMouseMove);

    return {
        update(newOptions) {
            if (newOptions) {
                Object.assign(config, {
                    animation: newOptions.animation || config.animation,
                    delay: newOptions.delay ?? config.delay,
                    style: { ...config.style, ...(newOptions.style || {}) },
                    theme: newOptions.theme || config.theme,
                    autoPosition: newOptions.autoPosition !== false,
                });
            }
        },
        destroy() {
            node.removeEventListener('mouseenter', handleMouseEnter);
            node.removeEventListener('mouseleave', handleMouseLeave);
            node.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(showTimeout);
            clearTimeout(hideTimeout);
            if (tooltipEl) {
                tooltipEl.remove();
                tooltipEl = null;
            }
        }
    };
}