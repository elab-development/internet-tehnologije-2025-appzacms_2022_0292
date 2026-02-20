export default function HeroEditor({ value, onChange }) {
  return (
    <div className='space-y-3'>
      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Title</label>
        <input
          className='w-full border rounded px-3 py-2 text-sm'
          value={value.title || ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </div>
      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Subtitle</label>
        <input
          className='w-full border rounded px-3 py-2 text-sm'
          value={value.subtitle || ''}
          onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
        />
      </div>
      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Align</label>
        <select
          className='w-full border rounded px-3 py-2 text-sm bg-white'
          value={value.align || 'left'}
          onChange={(e) => onChange({ ...value, align: e.target.value })}
        >
          <option value='left'>left</option>
          <option value='center'>center</option>
        </select>
      </div>
    </div>
  );
}
