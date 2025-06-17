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
    let currentButtons = [];
    
    // Function to check if we're on a matching route
    function isMatchingRoute() {
        return pathPattern.test(window.location.pathname);
    }
    
    // Function to remove existing buttons
    function removeExistingButtons() {
        currentButtons.forEach(button => {
            if (button && button.parentNode) {
                button.parentNode.removeChild(button);
            }
        });
        currentButtons = [];
        console.log('WebSim Copy ID: Removed existing buttons');
    }
    
    // Function to check for iframes
    function checkForIframes() {
        const iframes = document.querySelectorAll('iframe');
        return iframes.length > 0 ? iframes[0] : null;
    }
    
    // Function to create the copy buttons
    function createCopyButtons(iframe) {
        const targetContainer = document.querySelector('body > div > div.flex.items-stretch.flex-1.max-h-full.gap-0 > div.flex-1.flex.h-\\[100svh\\].relative > div.h-\\[44px\\].flex.flex-col.items-stretch.w-full.bg-adaptive-100.absolute.top-0 > div > div.flex.items-center.gap-1.flex-1.justify-end.h-full.px-2');
        
        if (!targetContainer) {
            console.error('WebSim Copy ID: Could not find target container for buttons');
            return;
        }
        
        // Remove any existing buttons first
        removeExistingButtons();
        
        // Function to extract project ID from iframe
        function extractProjectId() {
            if (!iframe) {
                console.error('WebSim Copy ID: No iframe available');
                return null;
            }
            
            const iframeSrc = iframe.src;
            if (!iframeSrc) {
                console.error('WebSim Copy ID: Iframe has no src attribute');
                return null;
            }
            
            console.log('WebSim Copy ID: Iframe src:', iframeSrc);
            
            // Extract ID from URL pattern: https://[ID].c.websim.com
            const urlMatch = iframeSrc.match(/^https:\/\/([^.]+)\.c\.websim\.com/);
            if (!urlMatch || !urlMatch[1]) {
                console.error('WebSim Copy ID: Could not extract ID from iframe URL. Expected pattern: https://[ID].c.websim.com');
                console.error('WebSim Copy ID: Actual URL:', iframeSrc);
                return null;
            }
            
            return urlMatch[1];
        }
        
        // Create the "Copy ID" button
        const copyIdButton = document.createElement('button');
        copyIdButton.textContent = 'Copy ID';
        copyIdButton.style.cssText = `
            background: #6b7280;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            margin-left: 8px;
        `;
        
        copyIdButton.addEventListener('mouseenter', () => {
            copyIdButton.style.background = '#4b5563';
        });
        
        copyIdButton.addEventListener('mouseleave', () => {
            copyIdButton.style.background = '#6b7280';
        });
        
        // Add click handler for Copy ID
        copyIdButton.addEventListener('click', async () => {
            try {
                console.log('WebSim Copy ID: Attempting to extract project ID from iframe URL...');
                
                const projectId = extractProjectId();
                if (!projectId) return;
                
                console.log('WebSim Copy ID: Extracted project ID:', projectId);
                
                // Copy ID to clipboard
                try {
                    await navigator.clipboard.writeText(projectId);
                    console.log('WebSim Copy ID: Copied ID to clipboard:', projectId);
                    
                    // Visual feedback
                    const originalText = copyIdButton.textContent;
                    copyIdButton.textContent = 'Copied!';
                    copyIdButton.style.background = '#10b981';
                    
                    setTimeout(() => {
                        copyIdButton.textContent = originalText;
                        copyIdButton.style.background = '#6b7280';
                    }, 2000);
                    
                } catch (clipboardError) {
                    console.error('WebSim Copy ID: Failed to copy to clipboard:', clipboardError);
                    console.log('WebSim Copy ID: Project ID (copy manually):', projectId);
                }
                
            } catch (error) {
                console.error('WebSim Copy ID: Error extracting project ID:', error);
            }
        });
        
        // Create the "Copy permanent link" button
        const copyLinkButton = document.createElement('button');
        copyLinkButton.textContent = 'Copy permanent link';
        copyLinkButton.style.cssText = `
            background: #3b82f6;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            margin-left: 4px;
        `;
        
        copyLinkButton.addEventListener('mouseenter', () => {
            copyLinkButton.style.background = '#2563eb';
        });
        
        copyLinkButton.addEventListener('mouseleave', () => {
            copyLinkButton.style.background = '#3b82f6';
        });
        
        // Add click handler for Copy permanent link
        copyLinkButton.addEventListener('click', async () => {
            try {
                console.log('WebSim Copy ID: Attempting to extract project ID from iframe URL...');
                
                const projectId = extractProjectId();
                if (!projectId) return;
                
                console.log('WebSim Copy ID: Extracted project ID:', projectId);
                
                // Check if current URL has a version number
                const currentPath = window.location.pathname;
                const versionMatch = currentPath.match(/^\/@[^/]+\/[^/]+\/(\d+)/);
                const version = versionMatch ? versionMatch[1] : null;
                
                let projectLink = `https://websim.com/p/${projectId}`;
                if (version) {
                    projectLink += `/${version}`;
                    console.log('WebSim Copy ID: Found version in URL:', version);
                }
                
                // Copy link to clipboard
                try {
                    await navigator.clipboard.writeText(projectLink);
                    console.log('WebSim Copy ID: Copied link to clipboard:', projectLink);
                    
                    // Visual feedback
                    const originalText = copyLinkButton.textContent;
                    copyLinkButton.textContent = 'Copied!';
                    copyLinkButton.style.background = '#10b981';
                    
                    setTimeout(() => {
                        copyLinkButton.textContent = originalText;
                        copyLinkButton.style.background = '#3b82f6';
                    }, 2000);
                    
                } catch (clipboardError) {
                    console.error('WebSim Copy ID: Failed to copy to clipboard:', clipboardError);
                    console.log('WebSim Copy ID: Project Link (copy manually):', projectLink);
                }
                
            } catch (error) {
                console.error('WebSim Copy ID: Error extracting project ID:', error);
            }
        });
        
        // Add both buttons to the container
        targetContainer.appendChild(copyIdButton);
        targetContainer.appendChild(copyLinkButton);
        
        // Keep track of buttons for cleanup
        currentButtons = [copyIdButton, copyLinkButton];
        console.log('WebSim Copy ID: Buttons created successfully');
    }
    
    // Main function to handle route changes
    function handleRouteChange() {
        console.log('WebSim Copy ID: Route changed to:', window.location.pathname);
        
        if (!isMatchingRoute()) {
            console.log('WebSim Copy ID: Not on a matching route, removing buttons');
            removeExistingButtons();
            return;
        }
        
        console.log('WebSim Copy ID: On matching route, checking for iframes...');
        
        // Check for existing iframe immediately
        const iframe = checkForIframes();
        if (iframe) {
            console.log('WebSim Copy ID: Found iframe, creating buttons');
            targetIframe = iframe;
            createCopyButtons(iframe);
        } else {
            console.log('WebSim Copy ID: No iframe found, removing buttons and waiting...');
            removeExistingButtons();
            
            // Set up observer to watch for iframe creation
            const observer = new MutationObserver((mutations) => {
                const iframe = checkForIframes();
                if (iframe) {
                    console.log('WebSim Copy ID: Iframe appeared, creating buttons');
                    targetIframe = iframe;
                    createCopyButtons(iframe);
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