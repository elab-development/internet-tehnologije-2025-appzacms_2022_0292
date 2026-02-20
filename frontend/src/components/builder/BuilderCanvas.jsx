import { useMemo, useState } from 'react';
import { nanoid } from 'nanoid';
import { BLOCKS } from './blockRegistry';
import BlockPalette from './BlockPalette';
import BlockRenderer from './BlockRenderer';
import BlockEditor from './BlockEditor';

export default function BuilderCanvas({ template, value, onChange }) {
  const allowed = useMemo(() => {
    const a = template?.config?.blocks?.allowed || [];
    return Array.isArray(a) ? a : [];
  }, [template]);

  const [selectedId, setSelectedId] = useState(null);

  const blocks = value?.blocks || [];

  const addBlock = (type) => {
    const defaults = template?.config?.blocks?.default || [];
    // ako template ima default za taj type, uzmi prvi matching
    const def = defaults.find((b) => b.type === type);
    const newBlock = {
      id: nanoid(8),
      type,
      props: def?.props ? { ...def.props } : {},
    };
    onChange({ ...value, blocks: [...blocks, newBlock] });
    setSelectedId(newBlock.id);
  };

  const removeBlock = (id) => {
    onChange({ ...value, blocks: blocks.filter((b) => b.id !== id) });
    if (selectedId === id) setSelectedId(null);
  };

  const moveBlock = (id, dir) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= blocks.length) return;

    const copy = [...blocks];
    const tmp = copy[idx];
    copy[idx] = copy[next];
    copy[next] = tmp;

    onChange({ ...value, blocks: copy });
  };

  const updateBlockProps = (id, nextProps) => {
    onChange({
      ...value,
      blocks: blocks.map((b) => (b.id === id ? { ...b, props: nextProps } : b)),
    });
  };

  const selected = blocks.find((b) => b.id === selectedId) || null;

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
      {/* left: palette */}
      <div className='lg:col-span-1'>
        <div className='rounded border p-3 space-y-3'>
          <div className='text-sm font-medium'>Blocks</div>
          <BlockPalette allowed={allowed} onAdd={addBlock} />
        </div>
      </div>

      {/* middle: canvas */}
      <div className='lg:col-span-1'>
        <div className='rounded border p-3 space-y-3'>
          <div className='text-sm font-medium'>Canvas</div>

          {blocks.length === 0 ? (
            <div className='text-sm text-gray-500'>No blocks yet.</div>
          ) : (
            <div className='space-y-2'>
              {blocks.map((b) => {
                const isSelected = b.id === selectedId;
                const Render = BLOCKS[b.type]?.Render;

                return (
                  <div
                    key={b.id}
                    className={`rounded border p-2 ${isSelected ? 'border-gray-900' : 'border-gray-200'}`}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <button
                        type='button'
                        onClick={() => setSelectedId(b.id)}
                        className='text-left text-sm font-medium underline'
                      >
                        {b.type} • {b.id}
                      </button>

                      <div className='flex items-center gap-2'>
                        <button
                          type='button'
                          onClick={() => moveBlock(b.id, -1)}
                          className='text-xs px-2 py-1 rounded border hover:bg-gray-50'
                        >
                          ↑
                        </button>
                        <button
                          type='button'
                          onClick={() => moveBlock(b.id, +1)}
                          className='text-xs px-2 py-1 rounded border hover:bg-gray-50'
                        >
                          ↓
                        </button>
                        <button
                          type='button'
                          onClick={() => removeBlock(b.id)}
                          className='text-xs px-2 py-1 rounded border hover:bg-gray-50'
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className='mt-2 rounded bg-gray-50 p-2'>
                      {Render ? (
                        <BlockRenderer template={template} block={b} />
                      ) : (
                        <div className='text-xs text-red-700'>
                          Unknown block type: {b.type}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* right: editor */}
      <div className='lg:col-span-1'>
        <div className='rounded border p-3 space-y-3'>
          <div className='text-sm font-medium'>Editor</div>
          {!selected ? (
            <div className='text-sm text-gray-500'>Select a block to edit.</div>
          ) : (
            <BlockEditor
              template={template}
              block={selected}
              onChange={(nextProps) => updateBlockProps(selected.id, nextProps)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
