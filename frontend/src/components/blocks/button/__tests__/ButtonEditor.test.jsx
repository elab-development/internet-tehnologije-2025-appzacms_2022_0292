import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import ButtonEditor from '../ButtonEditor';

function Harness({
  initial = { text: '', href: '', variant: 'primary' },
  onSpy,
}) {
  const [value, setValue] = useState(initial);

  return (
    <ButtonEditor
      value={value}
      onChange={(next) => {
        setValue(next);
        onSpy?.(next);
      }}
    />
  );
}

describe('ButtonEditor', () => {
  test('updates text, href and variant', async () => {
    const user = userEvent.setup();
    const spy = vi.fn();

    render(
      <Harness
        initial={{ text: '', href: '', variant: 'primary' }}
        onSpy={spy}
      />,
    );

    await user.type(screen.getByPlaceholderText(/read more/i), 'Read');
    await user.type(screen.getByPlaceholderText(/\/about/i), '/about');
    await user.selectOptions(screen.getByRole('combobox'), 'secondary');

    expect(spy).toHaveBeenLastCalledWith({
      text: 'Read',
      href: '/about',
      variant: 'secondary',
    });

    expect(screen.getByPlaceholderText(/read more/i)).toHaveValue('Read');
    expect(screen.getByPlaceholderText(/\/about/i)).toHaveValue('/about');
    expect(screen.getByRole('combobox')).toHaveValue('secondary');
  });
});
