export default function TextEditor({ value, onChange }) {
  return (
    <div className='space-y-2'>
      <label className='text-xs text-gray-600'>Text</label>
      <textarea
        className='w-full border rounded px-3 py-2 text-sm'
        rows={6}
        value={value.text || ''}
        onChange={(e) => onChange({ ...value, text: e.target.value })}
        placeholder='Write text...'
      />
    </div>
  );
}
