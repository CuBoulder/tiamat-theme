/**
 * @file
 * TOS Acceptance modal behaviors.
 */
(function (Drupal) {
  'use strict';

  // Store original body overflow style to restore later.
  let originalBodyOverflow = '';

  Drupal.behaviors.ucbTosAcceptance = {
    attach: function (context, settings) {
      // Check if we should show the TOS modal.
      const tosData = settings.ucb_tos_acceptance;
      if (!tosData || !tosData.show_modal) {
        return;
      }

      // Create modal if it doesn't exist.
      let modal = document.querySelector('.ucb-tos-modal');
      if (!modal) {
        modal = createTosModal(tosData.tos_url);
        document.body.appendChild(modal);
        
        // Attach event listeners only once when modal is created.
        attachEventListeners(modal);
      }

      // Show the modal.
      showModal(modal);
    }
  };

  /**
   * Attaches event listeners to the modal.
   */
  function attachEventListeners(modal) {
    const dialog = modal.querySelector('.ucb-tos-modal-dialog');
    const acceptButton = modal.querySelector('.ucb-tos-accept-button');
    
    // Handle accept button.
    if (acceptButton) {
      acceptButton.addEventListener('click', function(e) {
        e.preventDefault();
        handleAcceptance(acceptButton, modal);
      });
    }

    // Implement focus trap for keyboard navigation.
    if (dialog) {
      dialog.addEventListener('keydown', function(e) {
        handleFocusTrap(e, dialog);
      });
    }

    // Note: Close button, backdrop click, and Escape key handlers removed
    // to force users to accept TOS before continuing.
  }

  /**
   * Handles focus trapping within the modal.
   */
  function handleFocusTrap(e, dialog) {
    // Get all focusable elements within the modal.
    const focusableElements = dialog.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // If Tab is pressed and focus is on the last element, loop to first.
    if (e.key === 'Tab' && !e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
    // If Shift+Tab is pressed and focus is on the first element, loop to last.
    else if (e.key === 'Tab' && e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  }

  /**
   * Creates the TOS modal HTML structure.
   */
  function createTosModal(tosUrl) {
    const modal = document.createElement('div');
    modal.className = 'ucb-tos-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'ucb-tos-modal-title');
    modal.setAttribute('aria-describedby', 'ucb-tos-modal-description');
    modal.setAttribute('aria-modal', 'true');
    
    // Create aria-live region for status updates.
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'ucb-tos-modal-live-region';
    liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    document.body.appendChild(liveRegion);
    
    modal.innerHTML = `
      <div class="ucb-tos-modal-backdrop"></div>
      <div class="ucb-tos-modal-dialog">
        <div class="ucb-tos-modal-content">
          <div class="ucb-tos-modal-header">
            <h2 id="ucb-tos-modal-title" class="ucb-tos-modal-title">Terms of Service</h2>
          </div>
          <div class="ucb-tos-modal-body" id="ucb-tos-modal-description">
            <p>Please review and accept our Terms of Service to continue using this site.</p>
            <p>
              <a href="${tosUrl}" target="_blank" rel="noopener noreferrer">View Terms of Service</a>
            </p>
          </div>
          <div class="ucb-tos-modal-footer">
            <button type="button" class="ucb-tos-accept-button btn btn-primary">Accept</button>
          </div>
        </div>
      </div>
    `;
    
    // Store reference to live region on modal for easy access.
    modal.liveRegion = liveRegion;
    
    return modal;
  }

  /**
   * Shows the TOS modal.
   */
  function showModal(modal) {
    // Prevent background scrolling.
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    modal.classList.add('ucb-tos-modal-visible');
    modal.removeAttribute('hidden');
    
    // Focus the accept button for accessibility.
    const acceptButton = modal.querySelector('.ucb-tos-accept-button');
    if (acceptButton) {
      setTimeout(function() {
        acceptButton.focus();
      }, 100);
    }
    
    // Announce modal to screen readers.
    if (modal.liveRegion) {
      modal.liveRegion.textContent = 'Terms of Service dialog opened. Please review and accept the Terms of Service to continue.';
    }
  }

  /**
   * Hides the TOS modal.
   */
  function hideModal(modal) {
    // Restore background scrolling.
    document.body.style.overflow = originalBodyOverflow;
    
    modal.classList.remove('ucb-tos-modal-visible');
    modal.setAttribute('hidden', '');
    
    // Clear live region.
    if (modal.liveRegion) {
      modal.liveRegion.textContent = '';
    }
  }

  /**
   * Handles TOS acceptance via AJAX.
   */
  function handleAcceptance(button, modal) {
    // Disable button to prevent multiple submissions.
    button.disabled = true;
    const originalButtonText = button.textContent;
    button.textContent = 'Processing...';
    
    // Update aria-live region to announce processing state.
    if (modal.liveRegion) {
      modal.liveRegion.textContent = 'Processing your acceptance of the Terms of Service. Please wait.';
    }

    // Get accept URL from settings, fallback to default.
    const tosData = drupalSettings.ucb_tos_acceptance || {};
    const acceptUrl = tosData.accept_url || '/ucb-user-invite/tos-acceptance/accept';

    // Get CSRF token and make request.
    getCsrfToken()
      .then(function(csrfToken) {
        // Make AJAX request.
        return fetch(acceptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          },
          credentials: 'same-origin',
        });
      })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(function(data) {
        if (data.success) {
          // Announce success to screen readers.
          if (modal.liveRegion) {
            modal.liveRegion.textContent = 'Terms of Service accepted successfully.';
          }
          
          // Hide modal on success.
          hideModal(modal);
          
          // Optionally show a success message via Drupal.announce.
          if (typeof Drupal !== 'undefined' && Drupal.announce) {
            Drupal.announce('Terms of Service accepted successfully.', 'polite');
          }
        } else {
          throw new Error(data.message || 'Failed to accept TOS');
        }
      })
      .catch(function(error) {
        console.error('Error accepting TOS:', error);
        button.disabled = false;
        button.textContent = originalButtonText;
        
        // Show accessible error message via aria-live region.
        const errorMessage = 'An error occurred while accepting the Terms of Service. Please try again.';
        if (modal.liveRegion) {
          modal.liveRegion.textContent = errorMessage;
        }
        
        // Also use Drupal.announce if available for better screen reader support.
        if (typeof Drupal !== 'undefined' && Drupal.announce) {
          Drupal.announce(errorMessage, 'assertive');
        }
        
        // Focus the button again so user can retry.
        setTimeout(function() {
          button.focus();
        }, 100);
      });
  }

  /**
   * Gets the CSRF token from Drupal.
   */
  function getCsrfToken() {
    // Fetch token from Drupal's session/token endpoint.
    return fetch('/session/token', {
      method: 'GET',
      credentials: 'same-origin',
    })
    .then(function(response) {
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }
      return response.text();
    })
    .then(function(token) {
      return token.trim();
    });
  }

})(Drupal);
