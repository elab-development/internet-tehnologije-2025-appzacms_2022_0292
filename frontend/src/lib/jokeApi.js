export async function fetchRandomJoke({
  category = 'Any',
  safeMode = true,
} = {}) {
  const base = `https://v2.jokeapi.dev/joke/${encodeURIComponent(category)}`;

  const params = new URLSearchParams();
  if (safeMode) params.set('safe-mode', '');
  const url = params.toString() ? `${base}?${params.toString()}` : base;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`JokeAPI error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data?.error) {
    throw new Error(data?.message || 'JokeAPI returned an error');
  }

  let text = '';
  if (data.type === 'single') text = data.joke || '';
  if (data.type === 'twopart')
    text = `${data.setup || ''}\n\n${data.delivery || ''}`.trim();

  return {
    text,
    category: data?.category,
    raw: data,
  };
}
