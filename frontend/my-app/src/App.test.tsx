import React from 'react';
import { render, screen } from '@testing-library/react';
import MenuTest from './pages/Menu';

test('renders learn react link', () => {
  render(<MenuTest />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
