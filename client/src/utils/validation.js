export const validateUrl = (str) => {
  try {
    const u = new URL(str);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
};