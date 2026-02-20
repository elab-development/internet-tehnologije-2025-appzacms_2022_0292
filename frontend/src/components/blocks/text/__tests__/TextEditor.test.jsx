import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import TextEditor from '../TextEditor';

function Harness({ initial = { text: '' }, onSpy }) {
  const [value, setValue] = useState(initial);

  return (
    <TextEditor
      value={value}
      onChange={(next) => {
        setValue(next);
        onSpy?.(next);
      }}
    />
  );
}

describe('TextEditor', () => {
  test('calls onChange with updated text', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();

    render(<Harness initial={{ text: '' }} onSpy={spy} />);

    const ta = screen.getByPlaceholderText(/write text/i);
    await user.type(ta, 'abc');

    expect(spy).toHaveBeenLastCalledWith({ text: 'abc' });
    expect(ta).toHaveValue('abc');
  });
});
