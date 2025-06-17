// ==UserScript==
// @name         WebSim Copy ID
// @namespace    https://websim.com
// @version      1.0
// @description  Copy WebSim project ID link to clipboard
// @author       literallytwo
// @match        https://websim.com/@*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // Check if we're on the right route pattern
    const pathPattern = /^\/@[^/]+\/[^/]+/;
    if (!pathPattern.test(window.location.pathname)) {
        console.log('WebSim Copy ID: Not on a matching route');
        return;
    }
    
    console.log('WebSim Copy ID: Script loaded on matching route');
    
    let targetIframe = null;
    let isIframeFound = false;
    
    // Function to wait for iframe creation
    function waitForIframe() {
        return new Promise((resolve, reject) => {
            // Check if iframe already exists
            const existingIframes = document.querySelectorAll('iframe');
            if (existingIframes.length > 0) {
                targetIframe = existingIframes[0];
                isIframeFound = true;
                console.log('WebSim Copy ID: Found existing iframe');
                resolve(existingIframes[0]);
                return;
            }
            
            // Set up MutationObserver to watch for new iframes
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the added node is an iframe
                            if (node.tagName === 'IFRAME') {
                                targetIframe = node;
                                isIframeFound = true;
                                observer.disconnect();
                                console.log('WebSim Copy ID: Found new iframe');
                                resolve(node);
                                return;
                            }
                            
                            // Check if any child nodes are iframes
                            const iframes = node.querySelectorAll ? node.querySelectorAll('iframe') : [];
                            if (iframes.length > 0) {
                                targetIframe = iframes[0];
                                isIframeFound = true;
                                observer.disconnect();
                                console.log('WebSim Copy ID: Found iframe in added content');
                                resolve(iframes[0]);
                                return;
                            }
                        }
                    });
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Timeout after 5 seconds
            setTimeout(() => {
                if (!isIframeFound) {
                    observer.disconnect();
                    console.log('WebSim Copy ID: Timeout - no iframe found after 5 seconds');
                    reject(new Error('Timeout waiting for iframe'));
                }
            }, 5000);
        });
    }
    
    // Function to create the copy button
    function createCopyButton() {
        const targetContainer = document.querySelector('body > div > div.flex.items-stretch.flex-1.max-h-full.gap-0 > div.flex-1.flex.h-\\[100svh\\].relative > div.h-\\[44px\\].flex.flex-col.items-stretch.w-full.bg-adaptive-100.absolute.top-0 > div > div.flex.items-center.gap-1.flex-1.justify-end.h-full.px-2');
        
        if (!targetContainer) {
            console.error('WebSim Copy ID: Could not find target container for button');
            return;
        }
        
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
            if (!targetIframe) {
                console.error('WebSim Copy ID: No iframe available');
                return;
            }
            
            try {
                console.log('WebSim Copy ID: Attempting to extract project ID from iframe URL...');
                
                // Get the iframe src URL
                const iframeSrc = targetIframe.src;
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
        console.log('WebSim Copy ID: Button created successfully');
    }
    
    // Main execution
    waitForIframe()
        .then(() => {
            console.log('WebSim Copy ID: Iframe found, creating button...');
            // Wait a bit for the UI to stabilize
            setTimeout(createCopyButton, 1000);
        })
        .catch((error) => {
            console.log('WebSim Copy ID: Failed to find iframe:', error.message);
        });
    
})(); 