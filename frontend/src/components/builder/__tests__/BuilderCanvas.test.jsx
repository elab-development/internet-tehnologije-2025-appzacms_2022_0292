import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// mock nanoid da bude stabilan
vi.mock('nanoid', () => ({
  nanoid: () => 'fixedid1',
}));

// mock registry render/editor da ne vuče prave blokove
vi.mock('../blockRegistry', () => ({
  BLOCKS: {
    text: {
      Render: ({ props }) => (
        <div data-testid='render-text'>{props.text || ''}</div>
      ),
      Editor: ({ value, onChange }) => (
        <button
          type='button'
          onClick={() => onChange({ ...value, text: 'Edited' })}
        >
          Edit text
        </button>
      ),
    },
  },
}));

import BuilderCanvas from '../BuilderCanvas';

describe('BuilderCanvas', () => {
  const template = {
    config: {
      blocks: {
        allowed: ['text'],
        default: [{ type: 'text', props: { text: 'Default text' } }],
      },
    },
  };

  test('shows empty state when no blocks', () => {
    render(
      <BuilderCanvas
        template={template}
        value={{ version: 1, blocks: [] }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/no blocks yet/i)).toBeInTheDocument();
  });

  test('adds a block from palette (uses template default props) and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <BuilderCanvas
        template={template}
        value={{ version: 1, blocks: [] }}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /\+ text/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0];

    expect(next.blocks).toHaveLength(1);
    expect(next.blocks[0]).toMatchObject({
      id: 'fixedid1',
      type: 'text',
      props: { text: 'Default text' },
    });
  });

  test('selects a block and updates props via editor (calls onChange)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const value = {
      version: 1,
      blocks: [{ id: 'b1', type: 'text', props: { text: 'Hello' } }],
    };

    render(
      <BuilderCanvas template={template} value={value} onChange={onChange} />,
    );

    // select block
    await user.click(screen.getByRole('button', { name: /text • b1/i }));
    // editor action
    await user.click(screen.getByRole('button', { name: /edit text/i }));

    const next = onChange.mock.calls[0][0];
    expect(next.blocks[0].props.text).toBe('Edited');
  });

  test('removes a block and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const value = {
      version: 1,
      blocks: [{ id: 'b1', type: 'text', props: { text: 'Hello' } }],
    };

    render(
      <BuilderCanvas template={template} value={value} onChange={onChange} />,
    );

    await user.click(screen.getByRole('button', { name: /remove/i }));

    const next = onChange.mock.calls[0][0];
    expect(next.blocks).toEqual([]);
  });
});
