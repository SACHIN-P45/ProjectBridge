/**
 * Formats a number as a currency string (INR by default for Razorpay)
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: INR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};
