import { getStyleClass } from '../../builder/templateUtils';

export default function CodeBlock({ template, props }) {
  const cls = getStyleClass(template, 'code', '');
  return (
    <pre className={cls}>
      <code>{props.code || ''}</code>
    </pre>
  );
}
