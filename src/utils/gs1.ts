import { GS1Settings } from '../types';

export class GS1BarcodeGenerator {
  private settings: GS1Settings;
  
  constructor(settings: GS1Settings) {
    this.settings = settings;
  }

  /**
   * Calculate check digit according to GS1 standard
   */
  private calculateCheckDigit(code: string): number {
    const digits = code.split('').map(Number);
    const sum = digits.reduce((acc, digit, index) => {
      const multiplier = (index % 2 === 0) ? 3 : 1;
      return acc + (digit * multiplier);
    }, 0);
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
  }

  /**
   * Generate sequence number with leading zeros
   */
  private generateSequence(): string {
    const counter = this.settings.sequence_counter;
    return String(counter).padStart(5, '0');
  }

  /**
   * Generate GTIN-13 barcode
   */
  private generateGTIN13(): string {
    if (!this.settings.company_prefix) {
      throw new Error('Company prefix is required for GTIN-13');
    }

    const prefix = this.settings.company_prefix.padStart(7, '0');
    const sequence = this.generateSequence();
    const base = `${prefix}${sequence}`;
    const checkDigit = this.calculateCheckDigit(base);
    
    return `${base}${checkDigit}`;
  }

  /**
   * Generate GTIN-14 barcode
   */
  private generateGTIN14(): string {
    if (!this.settings.company_prefix) {
      throw new Error('Company prefix is required for GTIN-14');
    }

    const indicator = '1'; // Packaging level indicator
    const prefix = this.settings.company_prefix.padStart(7, '0');
    const sequence = this.generateSequence();
    const base = `${indicator}${prefix}${sequence}`;
    const checkDigit = this.calculateCheckDigit(base);
    
    return `${base}${checkDigit}`;
  }

  /**
   * Generate SSCC (Serial Shipping Container Code)
   */
  private generateSSCC(): string {
    if (!this.settings.company_prefix || !this.settings.location_reference) {
      throw new Error('Company prefix and location reference are required for SSCC');
    }

    const extension = '0';
    const prefix = this.settings.company_prefix.padStart(7, '0');
    const location = this.settings.location_reference.padStart(2, '0');
    const sequence = this.generateSequence();
    const base = `${extension}${prefix}${location}${sequence}`;
    const checkDigit = this.calculateCheckDigit(base);
    
    return `${base}${checkDigit}`;
  }

  /**
   * Generate barcode based on configured format
   */
  public generateBarcode(): string {
    switch (this.settings.barcode_format) {
      case 'GTIN-13':
        return this.generateGTIN13();
      case 'GTIN-14':
        return this.generateGTIN14();
      case 'SSCC':
        return this.generateSSCC();
      default:
        throw new Error(`Unsupported barcode format: ${this.settings.barcode_format}`);
    }
  }

  /**
   * Validate a barcode according to GS1 standards
   */
  public validateBarcode(barcode: string): boolean {
    if (!/^\d+$/.test(barcode)) {
      return false;
    }

    const digits = barcode.split('').map(Number);
    const checkDigit = digits.pop()!;
    const calculatedCheck = this.calculateCheckDigit(digits.join(''));
    
    return checkDigit === calculatedCheck;
  }
}
