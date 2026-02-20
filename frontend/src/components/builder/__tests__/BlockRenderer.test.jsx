import { render, screen } from '@testing-library/react';

// mock blockRegistry
vi.mock('../blockRegistry', () => ({
  BLOCKS: {
    text: {
      Render: ({ props }) => <div data-testid='text-render'>{props.text}</div>,
    },
  },
}));

import BlockRenderer from '../BlockRenderer';

describe('BlockRenderer', () => {
  test('renders the correct block render component', () => {
    render(
      <BlockRenderer
        template={null}
        block={{ type: 'text', props: { text: 'Hello' } }}
      />,
    );
    expect(screen.getByTestId('text-render')).toHaveTextContent('Hello');
  });

  test('returns null for unknown block type', () => {
    const { container } = render(
      <BlockRenderer template={null} block={{ type: 'unknown', props: {} }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
