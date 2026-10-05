import { render, screen, fireEvent } from '@testing-library/react';
import RoomSizeCalculator from '@/components/RoomSizeCalculator';

describe('RoomSizeCalculator', () => {
  it('shows a recommended kW rating for a room after calculating', () => {
    render(<RoomSizeCalculator />);

    fireEvent.change(screen.getByLabelText('Length (m)'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Width (m)'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Height (m)'), { target: { value: '3' } });
    fireEvent.click(screen.getByText('Calculate'));

    expect(screen.getByText(/Room volume:/)).toBeInTheDocument();
    expect(screen.getByText(/Best fit for your space:/)).toBeInTheDocument();
  });
});