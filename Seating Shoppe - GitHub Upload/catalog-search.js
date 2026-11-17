const words = value => value.toLowerCase().match(/[a-z0-9]+/g) ?? [];
const stop = new Set(['a','an','the','for','with','and','me','show','find','i','want','something','that','has','please','looking']);

export function keywordMatches(entries, query) {
  const terms = words(query).filter(word => !stop.has(word));
  if (!terms.length) return [];
  return entries.map(entry => {
    const title = words(entry.title);
    const details = words(entry.description);
    const score = terms.reduce((sum, term) => sum +
      (title.some(word => word.startsWith(term)) ? 4 : details.some(word => word.startsWith(term)) ? 1 : 0), 0);
    return { entry, score };
  }).filter(result => result.score).sort((a,b) => b.score-a.score).map(result => result.entry);
}

let model;
const vectors = new WeakMap();
export async function semanticMatches(entries, query) {
  model ??= import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1')
    .then(({ pipeline, env }) => {
      env.allowLocalModels = false;
      return pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { dtype:'q8', device:'wasm' });
    }).catch(error => {
      model = undefined;
      throw error;
    });
  const extractor = await model;
  const options = { pooling:'mean', normalize:true };
  if (!vectors.has(entries)) {
    const indexed = extractor(entries.map(entry => entry.title + '. ' + entry.description), options)
      .then(output => output.tolist()).catch(error => {
        vectors.delete(entries);
        throw error;
      });
    vectors.set(entries, indexed);
  }
  const [index, queryOutput] = await Promise.all([vectors.get(entries), extractor(query, options)]);
  const [queryVector] = queryOutput.tolist();
  return entries.map((entry, i) => ({
    entry, score: index[i].reduce((sum, value, j) => sum + value * queryVector[j], 0),
  })).filter(result => result.score >= .25).sort((a,b) => b.score-a.score).map(result => result.entry);
}

export function installCatalogSearch(entries) {
  const form = document.querySelector('#catalogSearch');
  const input = form.querySelector('input');
  const status = document.querySelector('#searchStatus');
  const results = document.querySelector('#searchResults');
  let version = 0;
  function show(matches, message) {
    status.textContent = message;
    results.replaceChildren();
    for (const item of matches.slice(0, 12)) {
      const button = document.createElement('button');
      button.type = 'button';
      const title = document.createElement('strong');
      title.textContent = item.title;
      const detail = document.createElement('span');
      detail.textContent = item.kind + ' · ' + item.description;
      button.append(title, detail);
      button.onclick = item.open;
      results.append(button);
    }
  }
  input.addEventListener('input', () => {
    version++;
    const query = input.value.trim();
    const matches = keywordMatches(entries, query);
    show(matches, query ? (matches.length ? 'Keyword matches' : 'No keyword matches. Try AI search.') : '');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    const current = ++version;
    status.textContent = 'Loading AI search. The first search may take a moment…';
    try {
      const matches = await semanticMatches(entries, query);
      if (current === version) show(matches, matches.length ? 'Best matches by description' : 'No close matches found.');
    } catch {
      if (current === version) show(keywordMatches(entries, query), 'AI search is unavailable. Showing keyword matches.');
    }
  });
}
