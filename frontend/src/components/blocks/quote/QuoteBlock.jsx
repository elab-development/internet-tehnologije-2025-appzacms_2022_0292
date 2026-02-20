import { getStyleClass } from '../../builder/templateUtils';

export default function QuoteBlock({ template, props }) {
  const cls = getStyleClass(template, 'quote', '');
  return <blockquote className={cls}>{props.text || ''}</blockquote>;
}
