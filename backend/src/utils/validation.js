const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/~`]/;
const UPPERCASE_REGEX = /[A-Z]/;

export function validateName(name) {
  if (typeof name !== 'string') {
    return { isValid: false, message: 'Name is required' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 20 || trimmed.length > 60) {
    return { isValid: false, message: 'Name must be between 20 and 60 characters' };
  }
  return { isValid: true };
}

export function validateAddress(address) {
  if (typeof address !== 'string' || !address.trim()) {
    return { isValid: false, message: 'Address is required' };
  }
  if (address.trim().length > 400) {
    return { isValid: false, message: 'Address must not exceed 400 characters' };
  }
  return { isValid: true };
}

export function validatePassword(password) {
  if (typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8 || password.length > 16) {
    return { isValid: false, message: 'Password must be 8-16 characters long' };
  }
  if (!UPPERCASE_REGEX.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  return { isValid: true };
}

export function validateEmail(email) {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, message: 'Invalid email format' };
  }
  return { isValid: true };
}

export function validateRating(rating) {
  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return { isValid: false, message: 'Rating must be an integer between 1 and 5' };
  }
  return { isValid: true };
}

export function validateUserInput({ name, email, password, address }) {
  const nameCheck = validateName(name);
  if (!nameCheck.isValid) return nameCheck;

  const emailCheck = validateEmail(email);
  if (!emailCheck.isValid) return emailCheck;

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.isValid) return passwordCheck;

  const addressCheck = validateAddress(address);
  if (!addressCheck.isValid) return addressCheck;

  return { isValid: true };
}
