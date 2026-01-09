import DOMPurify from 'dompurify';

export const sanitizeHTML = (str) => {
    return DOMPurify.sanitize(str);
};
