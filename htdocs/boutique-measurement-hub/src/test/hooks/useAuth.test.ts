import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import { mockAdminLogin, mockCustomerLogin } from '../../services/api';
import { getAuthToken, setAuthToken, removeAuthToken } from '../../utils/storage';

// Mock the API and storage functions
vi.mock('../../services/api', () => ({
  mockAdminLogin: vi.fn(),
  mockCustomerLogin: vi.fn(),
}));

vi.mock('../../utils/storage', () => ({
  getAuthToken: vi.fn(),
  setAuthToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state and no user', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('handles customer login successfully', async () => {
    const mockUser = {
      id: 'CUST-001',
      name: 'Test User',
      phone: '1234567890',
      role: 'customer',
    };

    (mockCustomerLogin as any).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.loginAsCustomer('1234567890');
    });

    expect(mockCustomerLogin).toHaveBeenCalledWith('1234567890');
    expect(setAuthToken).toHaveBeenCalled();
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('handles admin login successfully', async () => {
    const mockAdmin = {
      id: 'ADMIN-001',
      name: 'Admin User',
      phone: '0000000000',
      role: 'admin',
    };

    (mockAdminLogin as any).mockResolvedValueOnce(mockAdmin);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.loginAsAdmin();
    });

    expect(mockAdminLogin).toHaveBeenCalled();
    expect(setAuthToken).toHaveBeenCalled();
    expect(result.current.user).toEqual(mockAdmin);
    expect(result.current.loading).toBe(false);
  });

  it('handles login errors correctly', async () => {
    const error = new Error('Login failed');
    (mockCustomerLogin as any).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      try {
        await result.current.loginAsCustomer('1234567890');
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('handles logout correctly', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      result.current.logout();
    });

    expect(removeAuthToken).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('loads user from token on mount', async () => {
    const mockToken = 'mock-token';
    const mockUser = {
      id: 'CUST-001',
      name: 'Test User',
      phone: '1234567890',
      role: 'customer',
    };

    (getAuthToken as any).mockReturnValueOnce(mockToken);
    (mockCustomerLogin as any).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useAuth());

    // Wait for the useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('handles invalid tokens on mount', async () => {
    const mockToken = 'invalid-token';
    (getAuthToken as any).mockReturnValueOnce(mockToken);
    (mockCustomerLogin as any).mockRejectedValueOnce(new Error('Invalid token'));

    const { result } = renderHook(() => useAuth());

    // Wait for the useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(removeAuthToken).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });
}); 