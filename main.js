
document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const location = document.getElementById('location').value.trim();
    const foodType = document.getElementById('foodType').value.trim();
    const quantity = document.getElementById('quantity').value.trim();
    const availability = document.getElementById('availability').value.trim();

    const loadingEl = document.getElementById('loading');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const submitBtn = document.getElementById('submitBtn');

    loadingEl.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    resultsContainer.replaceChildren();
    submitBtn.disabled = true;

    try {
        const response = await fetch('/api/search-partners', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                location,
                foodType,
                quantity,
                availability
            })
        });

        const result = await response.json();

        if (!response.ok || result.status !== 'success') {
            throw new Error(
                result.message || 'Unable to search for donation partners.'
            );
        }

        resultsSection.classList.remove('hidden');

        if (Array.isArray(result.data) && result.data.length > 0) {
            result.data.forEach(partner => {
                const card = document.createElement('div');
                card.className = 'result-card';

                const info = document.createElement('div');
                info.className = 'result-info';

                const heading = document.createElement('h3');
                heading.textContent = partner.name || 'Potential partner';

                const badge = document.createElement('span');
                badge.className = 'distance-badge';
                badge.textContent = partner.distance || 'Distance unverified';
                heading.appendChild(document.createTextNode(' '));
                heading.appendChild(badge);

                const note = document.createElement('p');
                note.className = 'result-meta';
                note.textContent = partner.note || 'Details not available.';

                const timing = document.createElement('p');
                timing.className = 'result-meta';
                timing.textContent = '🕒 ' + (
                    partner.timing || 'Contact to confirm availability'
                );

                info.append(heading, note, timing);
                card.appendChild(info);

                if (partner.source_url) {
                    try {
                        const url = new URL(partner.source_url);

                        if (url.protocol === 'https:' || url.protocol === 'http:') {
                            const link = document.createElement('a');
                            link.href = url.href;
                            link.target = '_blank';
                            link.rel = 'noopener noreferrer';
                            link.className = 'source-link';
                            link.textContent = 'View Source ↗';
                            card.appendChild(link);
                        }
                    } catch (error) {
                        console.warn('Invalid source URL:', error);
                    }
                }

                resultsContainer.appendChild(card);
            });
        } else {
            const message = document.createElement('p');
            message.className = 'subtitle';
            message.textContent =
                'No potential matches found. Try adjusting your search details.';
            resultsContainer.appendChild(message);
        }

    } catch (error) {
        alert(error.message || 'An error occurred while contacting the server.');
        console.error(error);
    } finally {
        loadingEl.classList.add('hidden');
        submitBtn.disabled = false;
    }
});
