document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleBlock');
  const websiteList = document.getElementById('websiteList');
  const cnDomainToggle = document.getElementById('cnDomainToggle');
  
  // Load CN domain toggle state
  chrome.storage.local.get(['blockCnDomains'], function(result) {
    cnDomainToggle.checked = result.blockCnDomains !== false; // Default to true
  });
  
  // Handle CN domain toggle
  cnDomainToggle.addEventListener('change', function() {
    chrome.storage.local.set({
      blockCnDomains: cnDomainToggle.checked
    }, function() {
      chrome.tabs.reload();
    });
  });
  
  // Function to update website list
  function updateWebsiteList() {
    chrome.storage.local.get(['blockedSites', 'activeBlocks'], function(result) {
      const blockedSites = result.blockedSites || [];
      const activeBlocks = result.activeBlocks || {};
      
      // Clear current list
      websiteList.innerHTML = '';
      
      // Add each website to the list
      blockedSites.forEach(site => {
        const item = document.createElement('div');
        item.className = 'website-item';
        
        // Website URL
        const url = document.createElement('span');
        url.textContent = site;
        
        // Toggle switch
        const label = document.createElement('label');
        label.className = 'switch';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = activeBlocks[site] !== false; // Default to true if not set
        
        const slider = document.createElement('span');
        slider.className = 'slider';
        
        label.appendChild(input);
        label.appendChild(slider);
        
        // Add toggle event listener
        input.addEventListener('change', function() {
          chrome.storage.local.get(['activeBlocks'], function(result) {
            const activeBlocks = result.activeBlocks || {};
            activeBlocks[site] = input.checked;
            chrome.storage.local.set({activeBlocks}, function() {
              chrome.tabs.reload();
            });
          });
        });
        
        item.appendChild(url);
        item.appendChild(label);
        websiteList.appendChild(item);
      });
    });
  }
  
  // Update current tab info
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = new URL(tabs[0].url).hostname;
    
    chrome.storage.local.get(['blockedSites'], function(result) {
      const blockedSites = result.blockedSites || [];
      toggleButton.textContent = blockedSites.includes(currentUrl) 
        ? 'Unblock This Website' 
        : 'Block This Website';
    });
  });
  
  // Handle block/unblock button
  toggleButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentUrl = new URL(tabs[0].url).hostname;
      
      chrome.storage.local.get(['blockedSites', 'activeBlocks'], function(result) {
        let blockedSites = result.blockedSites || [];
        let activeBlocks = result.activeBlocks || {};
        
        if (blockedSites.includes(currentUrl)) {
          blockedSites = blockedSites.filter(site => site !== currentUrl);
          delete activeBlocks[currentUrl];
          toggleButton.textContent = 'Block This Website';
        } else {
          blockedSites.push(currentUrl);
          activeBlocks[currentUrl] = true; // Default to active when added
          toggleButton.textContent = 'Unblock This Website';
        }
        
        chrome.storage.local.set({
          blockedSites: blockedSites,
          activeBlocks: activeBlocks
        }, function() {
          updateWebsiteList();
          chrome.tabs.reload();
        });
      });
    });
  });
  
  // Initial list update
  updateWebsiteList();
}); 