import { isValidPublicKey } from './helpers';

export const isValidPrice = (price: string | number): boolean => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(num) && num > 0;
};

export const isValidName = (name: string): boolean => {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 32;
};

export { isValidPublicKey };
