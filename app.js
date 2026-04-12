const ACTORS = {
    // 1. Edoke button
    edoke: "https://api.apify.com/v2/actor-tasks/miraculous_gadget~instagram-reel-scraper-task-ed1/run-sync-get-dataset-items?token=apify_api_FgUp4cxAGJFlIjdTNu7GX50ocKXS7Q05uofR",
    // 2. Richesty button
    richesty: "https://api.apify.com/v2/actor-tasks/certified_board~instagram-reel-scraper-task-richesity/run-sync-get-dataset-items?token=apify_api_wvn6Az9WoKoaFTwjvTAyJgbaCr4ugG0ciy6f",
    // 3. Optimus Chord button
    optimus: "https://api.apify.com/v2/actor-tasks/blissful_indication~instagram-reel-scraper-task-opt1/run-sync-get-dataset-items?token=apify_api_PF8nYUoRBlmCSIbID5HVAS7XeWJBz13Beoas",
    // 4. Sarcasm Reel button
    sarcasm: "https://api.apify.com/v2/actor-tasks/miraculous_gadget~instagram-scraper-task-sanyam/run-sync-get-dataset-items?token=apify_api_FgUp4cxAGJFlIjdTNu7GX50ocKXS7Q05uofR"
};

function updateStatus(id, status, text) {
    const badge = document.getElementById(`status-${id}`);
    badge.className = `badge status-${status}`;
    badge.textContent = text;
}

function displayResults(id, data, customCaptionText) {
    const resultsContainer = document.getElementById(`results-${id}`);
    
    // Safety check - we expect an array of results from Apify
    if (!data || !Array.isArray(data) || data.length === 0) {
        // Sometimes apify wraps it if there's an error.
        console.warn("Unexpected data structure: ", data);
        resultsContainer.innerHTML = `<div class="caption-display" style="color: #f87171;">No results returned or unexpected format from Apify. Check console.</div>`;
        return;
    }

    resultsContainer.innerHTML = ''; // Clear loading state

    // Get up to 3 items
    const itemsToDisplay = data.slice(0, 3);

    itemsToDisplay.forEach((item, index) => {
        // Safely extract the video URL
        const videoUrl = item.videoUrl || item.displayUrl || item.video_url || item.url;
        // Safely extract caption
        const originalCaption = item.caption || item.text || "No original caption found.";

        let finalCaption = customCaptionText 
            ? `[Custom Caption]: ${customCaptionText}\n\n---\n[Original]:\n${originalCaption}` 
            : `[Original]:\n${originalCaption}`;

        let mediaHtml = '';
        if (videoUrl) {
             mediaHtml = `
                <div class="video-container">
                    <video controls autoplay loop playsinline src="${videoUrl}"></video>
                </div>
             `;
        } else {
             mediaHtml = `<div class="caption-display" style="color: #fca5a5;">⚠️ No video URL found in the response.</div>`;
        }

        const itemWrapper = document.createElement('div');
        itemWrapper.style.marginBottom = "1.5rem";
        // Add a bottom border and padding to all items EXCEPT the very last one
        if (index !== itemsToDisplay.length - 1) {
            itemWrapper.style.borderBottom = "1px solid rgba(255,255,255,0.1)";
            itemWrapper.style.paddingBottom = "1.5rem";
        }

        itemWrapper.innerHTML = `
            ${mediaHtml}
            <div class="caption-display" style="margin-top: 1rem;">${finalCaption}</div>
        `;
        
        resultsContainer.appendChild(itemWrapper);
    });
}

async function runActor(id) {
    const btn = document.getElementById(`run-${id}`);
    const resultsContainer = document.getElementById(`results-${id}`);
    const customCaptionInput = document.getElementById(`custom-caption-${id}`);
    const customCaptionText = customCaptionInput.value.trim();

    // Visual loading state
    btn.disabled = true;
    updateStatus(id, 'running', 'Running... (May take 30s+)');
    resultsContainer.innerHTML = `<div class="caption-display" style="opacity: 0.7; font-style: italic;">Fetching video and data from Instagram...</div>`;

    try {
        // Run sync get dataset items via POST request 
        const response = await fetch(ACTORS[id], {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}) // Send empty JSON body to use task defaults
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        updateStatus(id, 'success', 'Success');
        displayResults(id, data, customCaptionText);

    } catch (error) {
        console.error(`Error running ${id}:`, error);
        updateStatus(id, 'error', 'Failed');
        resultsContainer.innerHTML = `<div class="caption-display" style="color: #f87171;">Error: ${error.message}</div>`;
    } finally {
        btn.disabled = false;
    }
}

// Event Listeners
document.getElementById('run-edoke').addEventListener('click', () => runActor('edoke'));
document.getElementById('run-richesty').addEventListener('click', () => runActor('richesty'));
document.getElementById('run-optimus').addEventListener('click', () => runActor('optimus'));
document.getElementById('run-sarcasm').addEventListener('click', () => runActor('sarcasm'));
