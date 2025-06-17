// ==UserScript==
// @name         WebSim Copy ID
// @namespace    https://websim.com
// @version      1.0
// @description  Copy WebSim project ID link to clipboard
// @author       literallytwo
// @match        https://websim.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    const pathPattern = /^\/@[^/]+\/[^/]+/;
    let targetIframe = null;
    let currentButton = null;
    
    // Function to check if we're on a matching route
    function isMatchingRoute() {
        return pathPattern.test(window.location.pathname);
    }
    
    // Function to remove existing button
    function removeExistingButton() {
        if (currentButton && currentButton.parentNode) {
            currentButton.parentNode.removeChild(currentButton);
            currentButton = null;
            console.log('WebSim Copy ID: Removed existing button');
        }
    }
    
    // Function to check for iframes
    function checkForIframes() {
        const iframes = document.querySelectorAll('iframe');
        return iframes.length > 0 ? iframes[0] : null;
    }
    
    // Function to create the copy button
    function createCopyButton(iframe) {
        const targetContainer = document.querySelector('body > div > div.flex.items-stretch.flex-1.max-h-full.gap-0 > div.flex-1.flex.h-\\[100svh\\].relative > div.h-\\[44px\\].flex.flex-col.items-stretch.w-full.bg-adaptive-100.absolute.top-0 > div > div.flex.items-center.gap-1.flex-1.justify-end.h-full.px-2');
        
        if (!targetContainer) {
            console.error('WebSim Copy ID: Could not find target container for button');
            return;
        }
        
        // Remove any existing button first
        removeExistingButton();
        
        // Create the button
        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy permanent link';
        copyButton.style.cssText = `
            background: #3b82f6;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            margin-left: 8px;
        `;
        
        copyButton.addEventListener('mouseenter', () => {
            copyButton.style.background = '#2563eb';
        });
        
        copyButton.addEventListener('mouseleave', () => {
            copyButton.style.background = '#3b82f6';
        });
        
        // Add click handler
        copyButton.addEventListener('click', async () => {
            if (!iframe) {
                console.error('WebSim Copy ID: No iframe available');
                return;
            }
            
            try {
                console.log('WebSim Copy ID: Attempting to extract project ID from iframe URL...');
                
                // Get the iframe src URL
                const iframeSrc = iframe.src;
                if (!iframeSrc) {
                    console.error('WebSim Copy ID: Iframe has no src attribute');
                    return;
                }
                
                console.log('WebSim Copy ID: Iframe src:', iframeSrc);
                
                // Extract ID from URL pattern: https://[ID].c.websim.com
                const urlMatch = iframeSrc.match(/^https:\/\/([^.]+)\.c\.websim\.com/);
                if (!urlMatch || !urlMatch[1]) {
                    console.error('WebSim Copy ID: Could not extract ID from iframe URL. Expected pattern: https://[ID].c.websim.com');
                    console.error('WebSim Copy ID: Actual URL:', iframeSrc);
                    return;
                }
                
                const projectId = urlMatch[1];
                console.log('WebSim Copy ID: Extracted project ID:', projectId);
                
                const projectLink = `https://websim.com/p/${projectId}`;
                
                // Copy to clipboard
                try {
                    await navigator.clipboard.writeText(projectLink);
                    console.log('WebSim Copy ID: Copied to clipboard:', projectLink);
                    
                    // Visual feedback
                    const originalText = copyButton.textContent;
                    copyButton.textContent = 'Copied!';
                    copyButton.style.background = '#10b981';
                    
                    setTimeout(() => {
                        copyButton.textContent = originalText;
                        copyButton.style.background = '#3b82f6';
                    }, 2000);
                    
                } catch (clipboardError) {
                    console.error('WebSim Copy ID: Failed to copy to clipboard:', clipboardError);
                    
                    // Fallback - show the link in console
                    console.log('WebSim Copy ID: Project Link (copy manually):', projectLink);
                }
                
            } catch (error) {
                console.error('WebSim Copy ID: Error extracting project ID:', error);
            }
        });
        
        targetContainer.appendChild(copyButton);
        currentButton = copyButton;
        console.log('WebSim Copy ID: Button created successfully');
    }
    
    // Main function to handle route changes
    function handleRouteChange() {
        console.log('WebSim Copy ID: Route changed to:', window.location.pathname);
        
        if (!isMatchingRoute()) {
            console.log('WebSim Copy ID: Not on a matching route, removing button');
            removeExistingButton();
            return;
        }
        
        console.log('WebSim Copy ID: On matching route, checking for iframes...');
        
        // Check for existing iframe immediately
        const iframe = checkForIframes();
        if (iframe) {
            console.log('WebSim Copy ID: Found iframe, creating button');
            targetIframe = iframe;
            createCopyButton(iframe);
        } else {
            console.log('WebSim Copy ID: No iframe found, removing button and waiting...');
            removeExistingButton();
            
            // Set up observer to watch for iframe creation
            const observer = new MutationObserver((mutations) => {
                const iframe = checkForIframes();
                if (iframe) {
                    console.log('WebSim Copy ID: Iframe appeared, creating button');
                    targetIframe = iframe;
                    createCopyButton(iframe);
                    observer.disconnect();
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Clean up observer after 10 seconds if no iframe found
            setTimeout(() => {
                observer.disconnect();
                console.log('WebSim Copy ID: Stopped watching for iframes after 10 seconds');
            }, 10000);
        }
    }
    
    // Set up SPA navigation detection
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
        originalPushState.apply(this, args);
        setTimeout(handleRouteChange, 100); // Small delay to let the page update
    };
    
    history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        setTimeout(handleRouteChange, 100);
    };
    
    window.addEventListener('popstate', () => {
        setTimeout(handleRouteChange, 100);
    });
    
    // Initial check on page load
    console.log('WebSim Copy ID: Script loaded, checking initial route');
    setTimeout(handleRouteChange, 1000); // Wait for page to fully load
    
})(); 