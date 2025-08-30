import { describe, it, expect } from 'vitest';
import {
  validatePhoneNumber,
  validateName,
  validateMeasurement,
  validateRequired,
  validateImageUrl,
  combineValidationResults,
} from '../../utils/validation';

describe('Validation Utils', () => {
  describe('validatePhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      const result = validatePhoneNumber('1234567890');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid phone numbers', () => {
      const result = validatePhoneNumber('123');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('valid 10-digit');
    });

    it('should reject empty phone numbers', () => {
      const result = validatePhoneNumber('');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('required');
    });
  });

  describe('validateName', () => {
    it('should validate correct names', () => {
      const result = validateName('John Doe');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject names with numbers', () => {
      const result = validateName('John123');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('letters and spaces');
    });

    it('should reject empty names', () => {
      const result = validateName('');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('required');
    });
  });

  describe('validateMeasurement', () => {
    it('should validate correct measurements', () => {
      const result = validateMeasurement('32.5', 'chest');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should allow empty measurements', () => {
      const result = validateMeasurement('', 'chest');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative measurements', () => {
      const result = validateMeasurement('-5', 'chest');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('negative');
    });

    it('should reject non-numeric measurements', () => {
      const result = validateMeasurement('abc', 'chest');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('valid number');
    });
  });

  describe('validateRequired', () => {
    it('should validate non-empty values', () => {
      const result = validateRequired('test', 'field');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty values', () => {
      const result = validateRequired('', 'field');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('field is required');
    });
  });

  describe('validateImageUrl', () => {
    it('should validate correct URLs', () => {
      const result = validateImageUrl('https://example.com/image.jpg');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should allow empty URLs', () => {
      const result = validateImageUrl('');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid URLs', () => {
      const result = validateImageUrl('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('valid URL');
    });
  });

  describe('combineValidationResults', () => {
    it('should combine multiple valid results', () => {
      const results = [
        validateName('John'),
        validatePhoneNumber('1234567890'),
      ];
      const combined = combineValidationResults(results);
      expect(combined.isValid).toBe(true);
      expect(combined.errors).toHaveLength(0);
    });

    it('should combine results with errors', () => {
      const results = [
        validateName('John123'),
        validatePhoneNumber('123'),
      ];
      const combined = combineValidationResults(results);
      expect(combined.isValid).toBe(false);
      expect(combined.errors.length).toBeGreaterThan(0);
    });
  });
}); 