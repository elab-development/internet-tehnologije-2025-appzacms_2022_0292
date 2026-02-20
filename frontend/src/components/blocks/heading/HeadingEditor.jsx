export default function HeadingEditor({ value, onChange }) {
  const level = value.level ?? 2;

  return (
    <div className='space-y-3'>
      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Level</label>
        <select
          className='w-full border rounded px-3 py-2 text-sm bg-white'
          value={level}
          onChange={(e) =>
            onChange({ ...value, level: Number(e.target.value) })
          }
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
      </div>

      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Text</label>
        <input
          className='w-full border rounded px-3 py-2 text-sm'
          value={value.text || ''}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          placeholder='Heading...'
        />
      </div>
    </div>
  );
}
