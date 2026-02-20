export default function ButtonEditor({ value, onChange }) {
  return (
    <div className='space-y-3'>
      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Text</label>
        <input
          className='w-full border rounded px-3 py-2 text-sm'
          value={value.text || ''}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          placeholder='e.g. Read more'
        />
      </div>

      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Href</label>
        <input
          className='w-full border rounded px-3 py-2 text-sm'
          value={value.href || ''}
          onChange={(e) => onChange({ ...value, href: e.target.value })}
          placeholder='e.g. /about or https://...'
        />
      </div>

      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Variant</label>
        <select
          className='w-full border rounded px-3 py-2 text-sm bg-white'
          value={value.variant || 'primary'}
          onChange={(e) => onChange({ ...value, variant: e.target.value })}
        >
          <option value='primary'>primary</option>
          <option value='secondary'>secondary</option>
        </select>
      </div>
    </div>
  );
}
