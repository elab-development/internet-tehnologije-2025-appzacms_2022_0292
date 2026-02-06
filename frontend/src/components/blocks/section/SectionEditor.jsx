export default function SectionEditor({ value, onChange }) {
  return (
    <div className='space-y-3'>
      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Padding (Tailwind)</label>
        <input
          className='w-full border rounded px-3 py-2 text-sm'
          value={value.padding || ''}
          onChange={(e) => onChange({ ...value, padding: e.target.value })}
          placeholder='e.g. py-6'
        />
      </div>

      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Background (Tailwind)</label>
        <input
          className='w-full border rounded px-3 py-2 text-sm'
          value={value.background || ''}
          onChange={(e) => onChange({ ...value, background: e.target.value })}
          placeholder='e.g. bg-gray-50'
        />
      </div>

      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Border (Tailwind)</label>
        <input
          className='w-full border rounded px-3 py-2 text-sm'
          value={value.border || ''}
          onChange={(e) => onChange({ ...value, border: e.target.value })}
          placeholder='e.g. border'
        />
      </div>

      <div className='space-y-1'>
        <label className='text-xs text-gray-600'>Rounded (Tailwind)</label>
        <input
          className='w-full border rounded px-3 py-2 text-sm'
          value={value.rounded || ''}
          onChange={(e) => onChange({ ...value, rounded: e.target.value })}
          placeholder='e.g. rounded'
        />
      </div>
    </div>
  );
}
