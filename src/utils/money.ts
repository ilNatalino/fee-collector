import { MoneyCents } from '@/src/types/group';

const EURO_INPUT_PATTERN = /^\d+(?:[.,]\d{1,2})?$/;

export function parseEuroInputToCents(input: string): MoneyCents | null {
  const normalized = input.trim();
  if (!normalized || !EURO_INPUT_PATTERN.test(normalized)) {
    return null;
  }

  const [wholePart, decimalPart = ''] = normalized.replace(',', '.').split('.');
  const cents = `${decimalPart}00`.slice(0, 2);

  return Number.parseInt(wholePart, 10) * 100 + Number.parseInt(cents, 10);
}

export function eurosToCents(amount: number): MoneyCents {
  return Math.round(amount * 100);
}

export function centsToEuros(amountCents: MoneyCents): number {
  return amountCents / 100;
}

export function formatCents(amountCents: MoneyCents): string {
  return centsToEuros(amountCents).toFixed(2);
}