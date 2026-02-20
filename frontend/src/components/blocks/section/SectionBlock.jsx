export default function SectionBlock({ template, props }) {
  const cls = template?.config?.styles?.section || 'mb-6';

  const padding = props.padding || '';
  const background = props.background || '';
  const rounded = props.rounded || '';
  const border = props.border || '';

  const finalClass = [cls, padding, background, rounded, border]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={finalClass}>
      <div className='text-xs text-gray-500'>SECTION</div>
    </div>
  );
}
