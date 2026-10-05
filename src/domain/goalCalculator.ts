export const MAX_AMOUNT_KRW = 1_000_000_000_000;
export const MAX_ANNUAL_RATE_PERCENT = 100;
export const MAX_CALCULATION_MONTHS = 1_200;

export interface GoalCalculationInput {
  currentAmount: number;
  monthlyContribution: number;
  targetAmount: number;
  annualRate: number;
}

export type InvalidGoalCalculationReason =
  | 'non-finite-input'
  | 'negative-input'
  | 'target-must-be-positive'
  | 'amount-exceeds-limit'
  | 'annual-rate-exceeds-limit';

export type GoalCalculationResult =
  | {
      status: 'achieved';
      months: number;
      balance: number;
    }
  | {
      status: 'unreachable';
      months: typeof MAX_CALCULATION_MONTHS;
      balance: number;
    }
  | {
      status: 'invalid';
      reason: InvalidGoalCalculationReason;
    };

function validateInput({
  currentAmount,
  monthlyContribution,
  targetAmount,
  annualRate,
}: GoalCalculationInput): InvalidGoalCalculationReason | null {
  const values = [currentAmount, monthlyContribution, targetAmount, annualRate];

  if (values.some((value) => !Number.isFinite(value))) {
    return 'non-finite-input';
  }

  if (values.some((value) => value < 0)) {
    return 'negative-input';
  }

  if (targetAmount <= 0) {
    return 'target-must-be-positive';
  }

  if (
    currentAmount > MAX_AMOUNT_KRW ||
    monthlyContribution > MAX_AMOUNT_KRW ||
    targetAmount > MAX_AMOUNT_KRW
  ) {
    return 'amount-exceeds-limit';
  }

  if (annualRate > MAX_ANNUAL_RATE_PERCENT) {
    return 'annual-rate-exceeds-limit';
  }

  return null;
}

/**
 * Finds the first month in which the target is reached. Each month applies
 * investment growth to the existing balance before adding that month's
 * contribution.
 */
export function calculateGoalDuration(
  input: GoalCalculationInput,
): GoalCalculationResult {
  const invalidReason = validateInput(input);

  if (invalidReason) {
    return { status: 'invalid', reason: invalidReason };
  }

  const { currentAmount, monthlyContribution, targetAmount, annualRate } =
    input;

  if (currentAmount >= targetAmount) {
    return { status: 'achieved', months: 0, balance: currentAmount };
  }

  const monthlyRate = (1 + annualRate / 100) ** (1 / 12) - 1;
  let balance = currentAmount;

  for (let months = 1; months <= MAX_CALCULATION_MONTHS; months += 1) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;

    if (balance >= targetAmount) {
      return { status: 'achieved', months, balance };
    }
  }

  return {
    status: 'unreachable',
    months: MAX_CALCULATION_MONTHS,
    balance,
  };
}
