export default function CodeEditor({ value, onChange }) {
  return (
    <div className='space-y-2'>
      <label className='text-xs text-gray-600'>Code</label>
      <textarea
        className='w-full border rounded px-3 py-2 text-sm font-mono'
        rows={8}
        value={value.code || ''}
        onChange={(e) => onChange({ ...value, code: e.target.value })}
        placeholder="console.log('hello')"
      />
    </div>
  );
}
