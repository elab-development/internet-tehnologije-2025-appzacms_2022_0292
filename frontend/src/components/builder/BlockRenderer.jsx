import { BLOCKS } from './blockRegistry';

export default function BlockRenderer({ template, block }) {
  const Render = BLOCKS[block.type]?.Render;
  if (!Render) return null;
  return <Render template={template} props={block.props || {}} />;
}
