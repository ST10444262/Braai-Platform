import { renderHook, act } from '@testing-library/react';
import { useCustomBuildForm } from '@/hooks/useCustomBuildForm';

//mocking the service again so no actual api calls are made during testing
jest.mock('@/services/CustomBuildService', () => ({
  submitCustomBuild: jest.fn().mockResolvedValue('mock-build-id'),
}));

import { submitCustomBuild } from '@/services/CustomBuildService';

describe('useCustomBuildForm', () => {
  it('shows the validation errors when different inputs on the form are left empty', () => {
    const { result } = renderHook(() => useCustomBuildForm('Braai'));

    act(() => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.errors.selectedType).toBeDefined();
    expect(result.current.errors.widthMm).toBeDefined();
    expect(result.current.errors.heightMm).toBeDefined();
    expect(result.current.errors.depthMm).toBeDefined();
    expect(result.current.errors.firstName).toBeDefined();
    expect(result.current.errors.lastName).toBeDefined();
    expect(result.current.errors.email).toBeDefined();
    expect(result.current.errors.phone).toBeDefined();
  });

  it('shows the error for an incorrect email address', () => {
    const { result } = renderHook(() => useCustomBuildForm('Fireplace'));

    act(() => {
      result.current.setSelectedType('Free Standing');
      result.current.setWidthMm('1200');
      result.current.setHeightMm('800');
      result.current.setDepthMm('500');
      result.current.setFirstName('Steven');
      result.current.setLastName('Gerrard');
      result.current.setEmail('not-an-email');
      result.current.setPhone('0821234567');
    });
    act(() => {
      result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.errors.email).toBe('Please enter a valid email address.');
  });

  it('changes the product category to the selected type when it is submitted', async () => {
    const { result } = renderHook(() => useCustomBuildForm('Braai'));

    act(() => {
      result.current.setSelectedType('Free Standing');
      result.current.setWidthMm('1200');
      result.current.setHeightMm('800');
      result.current.setDepthMm('500');
      result.current.setFirstName('Steven');
      result.current.setLastName('Gerrard');
      result.current.setEmail('sgerrard@example.com');
      result.current.setPhone('0821234567');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(submitCustomBuild).toHaveBeenCalledWith(
      expect.objectContaining({
        optionType: 'Free Standing Braai',
        widthMm: 1200,
        heightMm: 800,
        depthMm: 500,
      })
    );
    expect(result.current.submitted).toBe(true);
  });
});