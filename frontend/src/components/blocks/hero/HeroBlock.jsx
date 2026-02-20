export default function HeroBlock({ template, props }) {
  const align = props.align === 'center' ? 'text-center' : 'text-left';
  return (
    <div className={template?.config?.styles?.hero || ''}>
      <div className={align}>
        <div className='text-2xl font-bold'>{props.title || ''}</div>
        {props.subtitle ? (
          <div className='text-sm text-gray-600 mt-1'>{props.subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}
