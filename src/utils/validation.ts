export function validateEmail(email: string): string | null {
  if (!email || email.trim() === '') return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Enter a valid email (e.g. user@domain.com)';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password || password.trim() === '') return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!confirmPassword || confirmPassword.trim() === '') return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || phone.trim() === '') return 'Phone number is required';
  if (!/^\d+$/.test(phone.trim())) return 'Phone number must contain digits only';
  if (phone.trim().length < 7 || phone.trim().length > 15) return 'Enter a valid phone number';
  return null;
}

export function validateFullName(name: string): string | null {
  if (!name || name.trim() === '') return 'Full name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return null;
}
