import { render, screen } from '@testing-library/react';
import InfoBox from '@/components/InfoBox';

//describe sets up the test folder
describe('InfoBox', () => {
  it('renders the given label and value', () => { //describes the goal of the test
    render(<InfoBox label="Fuel Type" value="Gas" />); //places the infobox onto a virtual browser screen
    expect(screen.getByText('Fuel Type')).toBeInTheDocument(); //scans the virtual screen to verify
    expect(screen.getByText('Gas')).toBeInTheDocument();
  });
});