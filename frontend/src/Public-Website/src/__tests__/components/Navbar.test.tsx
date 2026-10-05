import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '@/components/Navbar';

// usePathname needs mocking outside a real Next.js router context
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Navbar', () => {
  it('it shows all the navigation links', () => {
    render(<Navbar />);
    ['HOME', 'BRAAIS', 'FIREPLACES', 'SPECIALS', 'CUSTOM PRODUCTS', 'CONTACT US'].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('opens the mobile menu when the burger button is clicked', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByLabelText('Toggle menu'));
    // links render a second time inside the opened mobile dropdown
    expect(screen.getAllByText('HOME').length).toBeGreaterThan(1);
  });
});