import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ButtonBlock from '../ButtonBlock';

describe('ButtonBlock', () => {
  test('renders anchor with text and href', () => {
    render(<ButtonBlock template={null} props={{ text: 'Go', href: '/x' }} />);
    const a = screen.getByRole('link', { name: 'Go' });
    expect(a).toHaveAttribute('href', '/x');
  });

  test('prevents default click navigation', async () => {
    const user = userEvent.setup();
    render(<ButtonBlock template={null} props={{ text: 'Go', href: '/x' }} />);
    const a = screen.getByRole('link', { name: 'Go' });

    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    a.dispatchEvent(ev);

    expect(ev.defaultPrevented).toBe(true);
    // ili preko user click:
    await user.click(a);
  });
});
