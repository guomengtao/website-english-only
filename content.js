// Function to check if domain is a .cn domain
function isCnDomain(domain) {
  // Convert to lowercase for case-insensitive matching
  domain = domain.toLowerCase();
  
  // List of Chinese domain endings to block
  const cnDomains = [
    '.cn',
    '.com.cn',
    '.net.cn',
    '.org.cn',
    '.gov.cn',
    '.edu.cn',
    '.ac.cn',
    '.mil.cn'
  ];
  
  // Check if domain ends with any of the Chinese domain endings
  return cnDomains.some(ending => domain.endsWith(ending));
}

// Function to block page
function blockPage() {
  // Prevent any content from loading
  document.documentElement.innerHTML = '';
  
  // Show our message
  document.documentElement.innerHTML = `
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-family: Arial, sans-serif;
          background-color: #f0f2f5;
        }
        .message {
          font-size: 48px;
          color: #1a1a1a;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="message">Hello English Only</div>
    </body>
  `;
}

// Run at document start
function checkAndBlockSite() {
  const currentUrl = window.location.hostname;
  
  chrome.storage.local.get(['blockedSites', 'activeBlocks', 'blockCnDomains'], function(result) {
    const blockedSites = result.blockedSites || [];
    const activeBlocks = result.activeBlocks || {};
    const blockCnDomains = result.blockCnDomains !== false; // Default to true
    
    // Block if either:
    // 1. Site is in blocklist and active, OR
    // 2. Site is a .cn domain and CN domain blocking is enabled
    if ((blockedSites.includes(currentUrl) && activeBlocks[currentUrl] !== false) || 
        (blockCnDomains && isCnDomain(currentUrl))) {
      blockPage();
    }
  });
}

// Run immediately
checkAndBlockSite();

// Also run when DOM content loaded (as backup)
document.addEventListener('DOMContentLoaded', checkAndBlockSite);

// Watch for dynamic changes
const observer = new MutationObserver(checkAndBlockSite);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
}); 