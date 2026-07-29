// A Small set of extremely common / well-known breached passwords.
// Not exhaustive - a real breach-check (e.g. HIBP Pwned Passwords) would be more thorough.
export const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "12345678", "123456789", "1234567890",
  "qwerty123", "qwertyuiop", "letmein123", "welcome123", "admin12345", "iloveyou1",
  "monkey123", "dragon123", "abc123456", "football1", "baseball1", "trustno1",
  "111111111", "000000000", "sunshine12", "princess1", "superman1", "starwars1",
  "changeme1", "letmein12", "passw0rd1", "admin1234", "qazwsx123", "master123",
]);

export function countCharacterClasses(password: string): number {
  return [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(password)).length;
}

export function isCommonPassword(passsword: string): boolean {
  return COMMON_PASSWORDS.has(passsword.toLowerCase());
}

export type PasswordChecks = {
  minLength: boolean;
  complexity: boolean;
  notCommon: boolean;
};

export function checkPassword(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    complexity: countCharacterClasses(password) >= 3,
    notCommon: !isCommonPassword(password),
  };
}

export type StrengthLevel = { score: 0 | 1 | 2 | 3 | 4; label: string; color: string };

export function getPasswordStrength(password: string): StrengthLevel {
  if (!password) return { score: 0, label: "", color: "bg-gray-200 dark:bg-gray-700" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >=12) score++;
  if (countCharacterClasses(password) >= 3) score++;
  if (countCharacterClasses(password) === 4 && password.length < 8) score = 0;

  const levels: StrengthLevel[] = [
    { score: 0, label: "Weak", color: "bg-red-500" },
    { score: 1, label: "Weak", color: "bg-red-500" },
    { score: 2, label: "Fair", color: "bg-yellow-500" },
    { score: 3, label: "Good", color: "bg-blue-500" },
    { score: 4, label: "Strong", color: "bg-green-500" },
  ];

  return levels[score];
}