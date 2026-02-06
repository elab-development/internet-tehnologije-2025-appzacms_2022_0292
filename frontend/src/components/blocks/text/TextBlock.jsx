import { getStyleClass } from '../../builder/templateUtils';

export default function TextBlock({ template, props }) {
  const cls = getStyleClass(template, 'text', '');
  return <p className={cls}>{props.text || ''}</p>;
}
