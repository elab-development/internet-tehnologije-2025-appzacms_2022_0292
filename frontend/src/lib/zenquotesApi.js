export async function fetchRandomQuote() {
  const url =
    'https://api.allorigins.win/raw?url=' +
    encodeURIComponent('https://zenquotes.io/api/random');

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`ZenQuotes error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  const item = Array.isArray(data) ? data[0] : null;

  return {
    text: item?.q || '',
    author: item?.a || '',
    raw: item,
  };
}
