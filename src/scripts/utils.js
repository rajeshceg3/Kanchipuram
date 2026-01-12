import DOMPurify from 'dompurify';

/**
 * Sanitizes a string of HTML using DOMPurify.
 * @param {string} str - The raw HTML string.
 * @returns {string} The sanitized HTML string.
 */
export const sanitizeHTML = (str) => {
    return DOMPurify.sanitize(str);
};
