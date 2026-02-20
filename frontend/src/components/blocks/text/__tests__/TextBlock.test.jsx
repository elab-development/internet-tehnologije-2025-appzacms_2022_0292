import { render, screen } from '@testing-library/react';
import TextBlock from '../TextBlock';

describe('TextBlock', () => {
  test('renders paragraph text', () => {
    render(<TextBlock template={null} props={{ text: 'Hello' }} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
