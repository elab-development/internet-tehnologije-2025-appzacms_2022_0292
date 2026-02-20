import { BLOCKS } from './blockRegistry';

export default function BlockEditor({ template, block, onChange }) {
  const Editor = BLOCKS[block.type]?.Editor;
  if (!Editor) return null;

  return (
    <Editor template={template} value={block.props || {}} onChange={onChange} />
  );
}
