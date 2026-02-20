export default function ButtonBlock({ template, props }) {
  const cls =
    template?.config?.styles?.button ||
    'inline-flex items-center px-4 py-2 rounded border';

  const text = props.text || 'Button';
  const href = props.href || '#';
  const variant = props.variant || 'primary';

  const fallback =
    variant === 'primary'
      ? 'inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800'
      : 'inline-flex items-center px-4 py-2 border rounded hover:bg-gray-50';

  const finalClass = cls?.trim() ? cls : fallback;

  return (
    <a href={href} className={finalClass} onClick={(e) => e.preventDefault()}>
      {text}
    </a>
  );
}
