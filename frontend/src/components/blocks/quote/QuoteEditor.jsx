import { useState } from 'react';
import { fetchRandomQuote } from '../../../lib/zenquotesApi';
import { fetchRandomJoke } from '../../../lib/jokeApi';

export default function QuoteEditor({ value, onChange }) {
  const [loading, setLoading] = useState(false);
  const [remoteError, setRemoteError] = useState('');

  const setText = (text) => onChange({ ...value, text });

  const onFetchQuote = async () => {
    setLoading(true);
    setRemoteError('');
    try {
      const q = await fetchRandomQuote();
      const txt = q.author ? `${q.text}\n— ${q.author}` : q.text;
      setText(txt);
    } catch (e) {
      console.log('Error fetching quote:', e);
      setRemoteError(e?.message || 'Failed to fetch quote');
    } finally {
      setLoading(false);
    }
  };

  const onFetchJoke = async () => {
    setLoading(true);
    setRemoteError('');
    try {
      const j = await fetchRandomJoke({ safeMode: true });
      setText(j.text);
    } catch (e) {
      setRemoteError(e?.message || 'Failed to fetch joke');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between gap-2'>
        <label className='text-xs text-gray-600'>Quote</label>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={onFetchQuote}
            disabled={loading}
            className='text-xs px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50'
            title='Fetch a random quote'
          >
            {loading ? 'Loading...' : 'Fetch quote'}
          </button>

          <button
            type='button'
            onClick={onFetchJoke}
            disabled={loading}
            className='text-xs px-2 py-1 rounded border hover:bg-gray-50 disabled:opacity-50'
            title='Fetch a random joke (safe-mode)'
          >
            {loading ? 'Loading...' : 'Fetch joke'}
          </button>
        </div>
      </div>

      {remoteError && (
        <div className='text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2'>
          {remoteError}
        </div>
      )}

      <textarea
        className='w-full border rounded px-3 py-2 text-sm'
        rows={4}
        value={value.text || ''}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        placeholder='Quote...'
      />

      <div className='flex items-center justify-between'>
        <button
          type='button'
          onClick={() => setText('')}
          className='text-xs underline text-gray-600 hover:text-gray-900'
        >
          Clear
        </button>
      </div>
    </div>
  );
}
