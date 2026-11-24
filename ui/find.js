const catalog = [
  { title: 'Holly Short Circuit', description: 'Conversation, camera, and microphone controls.', href: '#conversation',
    keywords: 'assistant chat talk voice speak recording audio camera permission' },
  { title: 'Animation library', description: 'Preview Holly’s character, expressions, companion, and Speaking Light modes.', href: '#library',
    keywords: 'avatar expression creator summon idle motion sphere full body' },
  { title: 'Animation assets', description: 'Browse the original Interface OS Green artwork and motion previews.',
    href: '../public/holly-green/assets/14_Previews/index.html', keywords: 'gif image icon poster svg png artwork' },
];

function tokens(text) {
  return text.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function findResults(query) {
  const terms = [...new Set(tokens(query))];
  if (!terms.length) return [];
  return catalog.map(entry => {
    const title = tokens(entry.title);
    const description = tokens(entry.description + ' ' + entry.keywords);
    const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 8
      : description.includes(term) ? 4
      : [...title, ...description].some(word => term.length >= 3 && word.startsWith(term)) ? 1 : 0), 0);
    return { ...entry, score };
  }).filter(entry => entry.score > 0).sort((a, b) => b.score - a.score);
}

export function parseFindCommand(message) {
  return /^(?:find|search(?: for)?)\s+(.+)$/i.exec(message.trim())?.[1]?.trim() ?? '';
}

export function mountFind({ form, input, results, status, web, onSearch }) {
  function search(value) {
    const query = value.trim().slice(0, input.maxLength);
    input.value = query;
    const matches = findResults(query);
    results.replaceChildren();
    for (const match of matches) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = match.href;
      link.textContent = match.title;
      const description = document.createElement('p');
      description.textContent = match.description;
      item.append(link, description);
      results.append(item);
    }
    status.textContent = !query ? 'Search Interface OS Green.' : matches.length
      ? matches.length + (matches.length === 1 ? ' local result' : ' local results')
      : 'No local results. Try another search or open web search.';
    web.hidden = !query;
    if (query) {
      const url = new URL('https://www.google.com/search');
      url.searchParams.set('q', query);
      web.href = url.href;
    } else {
      web.removeAttribute('href');
    }
    if (query) onSearch?.(query, matches);
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    search(input.value);
  });
  return search;
}
