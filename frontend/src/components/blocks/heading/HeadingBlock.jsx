import { getHeadingClass } from '../../builder/templateUtils';

export default function HeadingBlock({ template, props }) {
  const level = props.level || 2;
  const text = props.text || '';
  const cls = getHeadingClass(template, level);

  const Tag = `h${Math.min(3, Math.max(1, level))}`;
  return <Tag className={cls}>{text}</Tag>;
}
