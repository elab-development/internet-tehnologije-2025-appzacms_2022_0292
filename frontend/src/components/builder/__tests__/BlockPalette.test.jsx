import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BlockPalette from '../BlockPalette';

describe('BlockPalette', () => {
  test('renders buttons for allowed blocks', () => {
    render(<BlockPalette allowed={['text', 'quote']} onAdd={() => {}} />);

    expect(
      screen.getByRole('button', { name: /\+ text/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /\+ quote/i }),
    ).toBeInTheDocument();
  });

  test('calls onAdd with type when clicked', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();

    render(<BlockPalette allowed={['text']} onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: /\+ text/i }));
    expect(onAdd).toHaveBeenCalledWith('text');
  });
});
