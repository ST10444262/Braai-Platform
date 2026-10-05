import { renderHook, act } from '@testing-library/react';
import { useQuoteForm } from '@/hooks/useQuoteForm';

//mocks the service so no real api calls are made when testing
jest.mock('@/services/EnquiryService', () => ({
  submitQuoteRequest: jest.fn().mockResolvedValue('mock-enquiry-id'),
}));

import { submitQuoteRequest } from '@/services/EnquiryService';

describe('useQuoteForm', () => {
  const testProductId = 'test-product-123';

  it('shows errors to the user when form inputs are empty', () => {
    const { result } = renderHook(() => useQuoteForm(testProductId));

    act(() => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.errors.firstName).toBeDefined();
    expect(result.current.errors.lastName).toBeDefined();
    expect(result.current.errors.email).toBeDefined();
    expect(result.current.errors.phoneNumber).toBeDefined();
  });

  it('shows an error for an incorrect email format', () => {
    const { result } = renderHook(() => useQuoteForm(testProductId));

    act(() => {
      result.current.setFirstName('Mo');
      result.current.setLastName('Salah');
      result.current.setEmail('not-an-email');
      result.current.setPhoneNumber('0821234567');
    });
    act(() => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.errors.email).toBe('Please enter a valid email address.');
  });

  it('submits the form successfully and shows a success message', async () => {
    const { result } = renderHook(() => useQuoteForm(testProductId));

    act(() => {
      result.current.setFirstName('Conor');
      result.current.setLastName('Bradley');
      result.current.setEmail('conor@example.com');
      result.current.setPhoneNumber('0821234567');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(submitQuoteRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Conor',
        lastName: 'Bradley',
        email: 'conor@example.com',
        phone: '0821234567',
        productId: testProductId,
      })
    );
    expect(result.current.submitted).toBe(true);
  });
});