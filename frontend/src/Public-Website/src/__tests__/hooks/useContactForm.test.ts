import { renderHook, act } from '@testing-library/react';
import { useContactUsForm } from '@/hooks/useContactForm';

//using this to mock the api so the tests dont make an actual api call over the network
jest.mock('@/services/EnquiryService', () => ({
  submitEnquiry: jest.fn().mockResolvedValue('mock-enquiry-id'),
}));

describe('useContactForm', () => {
  it('shows validation errors when required fields are empty', () => {
    const { result } = renderHook(() => useContactUsForm());

    act(() => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.errors.firstName).toBeDefined();
    expect(result.current.errors.lastName).toBeDefined();
    expect(result.current.errors.email).toBeDefined();
    expect(result.current.errors.phoneNumber).toBeDefined();
    expect(result.current.errors.message).toBeDefined();
  });

  it('shows an error for an invalid email format', () => {
    const { result } = renderHook(() => useContactUsForm());

    act(() => {
      result.current.setFirstName('Connor');
      result.current.setLastName('McClure');
      result.current.setEmail('not-an-email');
      result.current.setPhoneNumber('0821234567');
      result.current.setMessage('Test message');
    });
    act(() => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.errors.email).toBe('Please enter a valid email address.');
  });
});