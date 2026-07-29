"use client";

import { checkPassword, getPasswordStrength } from "@/lib/passwordStrength";

export default function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const checks = checkPassword(password);
  const strength = getPasswordStrength(password);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3 ].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= strength.score - 1 ? strength.color : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>

      {strength.label && (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Strength: {strength.label}
        </span>
      )}

      <ul className="flex flex-col gap-0.5 text-xs">
        <li className={checks.minLength ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
          {checks.minLength ? "✓" : "○"} At least 8 characters
        </li>
        <li className={checks.complexity ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
          {checks.complexity ? "✓" : "○"} At least 3 of: uppercase, lowercase, number, symbol
        </li>
        <li className={checks.notCommon ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
          {checks.notCommon ? "✓" : "✕"} Not a common/known-breached password
        </li>
      </ul>
    </div>
  );
}