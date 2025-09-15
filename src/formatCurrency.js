// useFormatCurrency.js
import { computed } from 'vue'

export function useFormatCurrency() {
  /**
   * Format a number to currency with Nigerian Naira symbol
   * @param {number} value - The number to format
   * @param {number} decimals - Number of decimal places (default: 2)
   * @param {boolean} abbreviate - Whether to abbreviate large numbers (default: true)
   * @returns {string} - Formatted currency string
   */
  const formatCurrency = (value, decimals = 2, abbreviate = true) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '₦0.00'
    }

    // Fix decimal places
    const fixedValue = parseFloat(value).toFixed(decimals)

    // Handle abbreviation for large numbers
    if (abbreviate) {
      if (value >= 1000000) {
        // For millions (1M+)
        return `₦${(value / 1000000).toFixed(decimals)}M`
      } else if (value >= 1000) {
        // For thousands (1K+)
        return `₦${(value / 1000).toFixed(decimals)}K`
      }
    }

    // Regular formatting with commas as thousand separators
    return `₦${parseFloat(fixedValue).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`
  }

  /**
   * Format a number without currency symbol
   * @param {number} value - The number to format
   * @param {number} decimals - Number of decimal places (default: 0)
   * @returns {string} - Formatted number string
   */
  const formatNumber = (value, decimals = 0) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0'
    }

    return parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  return {
    formatCurrency,
    formatNumber,
  }
}
