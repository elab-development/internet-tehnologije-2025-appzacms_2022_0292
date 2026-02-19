import { render, screen } from '@testing-library/react';

// mock registry
vi.mock('../blockRegistry', () => ({
  BLOCKS: {
    text: {
      Editor: ({ value }) => <div data-testid='text-editor'>{value.text}</div>,
    },
  },
}));

import BlockEditor from '../BlockEditor';

describe('BlockEditor', () => {
  test('renders editor for known type', () => {
    render(
      <BlockEditor
        template={null}
        block={{ type: 'text', props: { text: 'X' } }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByTestId('text-editor')).toHaveTextContent('X');
  });

  test('returns null for unknown type', () => {
    const { container } = render(
      <BlockEditor
        template={null}
        block={{ type: 'unknown', props: {} }}
        onChange={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
