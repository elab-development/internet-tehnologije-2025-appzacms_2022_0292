const LABELS = {
  hero: 'Hero',
  heading: 'Heading',
  text: 'Text',
  quote: 'Quote',
  code: 'Code',
  button: 'Button',
  section: 'Section',
};

export default function BlockPalette({ allowed, onAdd }) {
  return (
    <div className='grid grid-cols-2 gap-2'>
      {allowed.map((type) => (
        <button
          key={type}
          type='button'
          onClick={() => onAdd(type)}
          className='px-3 py-2 rounded border hover:bg-gray-50 text-sm'
        >
          + {LABELS[type] || type}
        </button>
      ))}
    </div>
  );
}
