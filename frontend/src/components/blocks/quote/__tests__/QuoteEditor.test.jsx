import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../../lib/zenquotesApi', () => ({
  fetchRandomQuote: vi.fn(),
}));

vi.mock('../../../../lib/jokeApi', () => ({
  fetchRandomJoke: vi.fn(),
}));

import { fetchRandomQuote } from '../../../../lib/zenquotesApi';
import { fetchRandomJoke } from '../../../../lib/jokeApi';
import QuoteEditor from '../QuoteEditor';

describe('QuoteEditor', () => {
  test('fetch quote fills textarea', async () => {
    const user = userEvent.setup();
    fetchRandomQuote.mockResolvedValueOnce({ text: 'Q', author: 'A' });

    const onChange = vi.fn();
    render(<QuoteEditor value={{ text: '' }} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /fetch quote/i }));

    // očekujemo da je setovao "Q\n— A"
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)[0];
    expect(last.text).toContain('Q');
    expect(last.text).toContain('A');
  });

  test('fetch joke fills textarea', async () => {
    const user = userEvent.setup();
    fetchRandomJoke.mockResolvedValueOnce({ text: 'JOKE' });

    const onChange = vi.fn();
    render(<QuoteEditor value={{ text: '' }} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /fetch joke/i }));

    const last = onChange.mock.calls.at(-1)[0];
    expect(last.text).toBe('JOKE');
  });

  test('shows error if quote fetch fails', async () => {
    const user = userEvent.setup();
    fetchRandomQuote.mockRejectedValueOnce(new Error('Boom'));

    render(<QuoteEditor value={{ text: '' }} onChange={() => {}} />);

    await user.click(screen.getByRole('button', { name: /fetch quote/i }));

    expect(await screen.findByText(/boom/i)).toBeInTheDocument();
  });

  test('clear button resets text', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<QuoteEditor value={{ text: 'X' }} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(onChange).toHaveBeenCalledWith({ text: '' });
  });
});
