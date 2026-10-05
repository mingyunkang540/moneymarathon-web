import { describe, expect, it } from 'vitest';

import {
  MAX_AMOUNT_KRW,
  MAX_CALCULATION_MONTHS,
  calculateGoalDuration,
} from './goalCalculator';

describe('calculateGoalDuration', () => {
  it('case A: reaches 100 million KRW in exactly 47 months at 0% return', () => {
    const result = calculateGoalDuration({
      currentAmount: 30_000_000,
      monthlyContribution: 1_500_000,
      targetAmount: 100_000_000,
      annualRate: 0,
    });

    expect(result).toEqual({
      status: 'achieved',
      months: 47,
      balance: 100_500_000,
    });
  });

  it('case B: returns month zero when the initial balance already meets the target', () => {
    expect(
      calculateGoalDuration({
        currentAmount: 100_000_000,
        monthlyContribution: 0,
        targetAmount: 100_000_000,
        annualRate: 5,
      }),
    ).toEqual({
      status: 'achieved',
      months: 0,
      balance: 100_000_000,
    });
  });

  it('case C: reports unreachable when neither savings nor growth can close the gap', () => {
    expect(
      calculateGoalDuration({
        currentAmount: 30_000_000,
        monthlyContribution: 0,
        targetAmount: 100_000_000,
        annualRate: 0,
      }),
    ).toEqual({
      status: 'unreachable',
      months: MAX_CALCULATION_MONTHS,
      balance: 30_000_000,
    });
  });

  it.each([
    ['current amount', { currentAmount: -1 }],
    ['monthly contribution', { monthlyContribution: -1 }],
    ['target amount', { targetAmount: -1 }],
    ['annual rate', { annualRate: -1 }],
  ])('case D: rejects a negative %s', (_label, override) => {
    expect(
      calculateGoalDuration({
        currentAmount: 0,
        monthlyContribution: 1,
        targetAmount: 10,
        annualRate: 0,
        ...override,
      }),
    ).toEqual({ status: 'invalid', reason: 'negative-input' });
  });

  it('case E: calculates a 5% annual return with finite values', () => {
    const result = calculateGoalDuration({
      currentAmount: 30_000_000,
      monthlyContribution: 1_500_000,
      targetAmount: 100_000_000,
      annualRate: 5,
    });

    expect(result.status).toBe('achieved');
    if (result.status === 'achieved') {
      expect(result.months).toBe(40);
      expect(Number.isFinite(result.balance)).toBe(true);
      expect(result.balance).toBeGreaterThanOrEqual(100_000_000);
    }
  });

  it('case F: adding 200,000 KRW per month never delays the target', () => {
    const baseInput = {
      currentAmount: 30_000_000,
      monthlyContribution: 1_500_000,
      targetAmount: 100_000_000,
      annualRate: 5,
    };

    const current = calculateGoalDuration(baseInput);
    const increased = calculateGoalDuration({
      ...baseInput,
      monthlyContribution: baseInput.monthlyContribution + 200_000,
    });

    expect(current.status).toBe('achieved');
    expect(increased.status).toBe('achieved');
    if (current.status === 'achieved' && increased.status === 'achieved') {
      expect(increased.months).toBeLessThanOrEqual(current.months);
    }
  });

  it('applies growth before adding the month-end contribution', () => {
    const result = calculateGoalDuration({
      currentAmount: 100_000_000,
      monthlyContribution: 1_000_000,
      targetAmount: 101_950_000,
      annualRate: 12,
    });

    expect(result.status).toBe('achieved');
    if (result.status === 'achieved') {
      expect(result.months).toBe(2);
    }
  });

  it('uses the effective monthly rate derived from the annual rate', () => {
    const result = calculateGoalDuration({
      currentAmount: 100_000_000,
      monthlyContribution: 0,
      targetAmount: 104_999_999,
      annualRate: 5,
    });

    expect(result.status).toBe('achieved');
    if (result.status === 'achieved') {
      expect(result.months).toBe(12);
      expect(result.balance).toBeCloseTo(105_000_000, 5);
    }
  });

  it('distinguishes a target reached at month 1200 from one beyond the limit', () => {
    const atLimit = calculateGoalDuration({
      currentAmount: 0,
      monthlyContribution: 1,
      targetAmount: 1_200,
      annualRate: 0,
    });
    const beyondLimit = calculateGoalDuration({
      currentAmount: 0,
      monthlyContribution: 1,
      targetAmount: 1_201,
      annualRate: 0,
    });

    expect(atLimit).toEqual({
      status: 'achieved',
      months: 1_200,
      balance: 1_200,
    });
    expect(beyondLimit).toEqual({
      status: 'unreachable',
      months: 1_200,
      balance: 1_200,
    });
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rejects non-finite input: %s',
    (currentAmount) => {
      expect(
        calculateGoalDuration({
          currentAmount,
          monthlyContribution: 1,
          targetAmount: 10,
          annualRate: 0,
        }),
      ).toEqual({ status: 'invalid', reason: 'non-finite-input' });
    },
  );

  it('rejects zero targets before checking initial achievement', () => {
    expect(
      calculateGoalDuration({
        currentAmount: 0,
        monthlyContribution: 0,
        targetAmount: 0,
        annualRate: 0,
      }),
    ).toEqual({ status: 'invalid', reason: 'target-must-be-positive' });
  });

  it.each([
    { currentAmount: MAX_AMOUNT_KRW + 1 },
    { monthlyContribution: MAX_AMOUNT_KRW + 1 },
    { targetAmount: MAX_AMOUNT_KRW + 1 },
  ])('rejects amounts above the public limit', (override) => {
    expect(
      calculateGoalDuration({
        currentAmount: 0,
        monthlyContribution: 1,
        targetAmount: 10,
        annualRate: 0,
        ...override,
      }),
    ).toEqual({ status: 'invalid', reason: 'amount-exceeds-limit' });
  });

  it('accepts amount and annual-rate limits, but rejects a rate above the limit', () => {
    expect(
      calculateGoalDuration({
        currentAmount: MAX_AMOUNT_KRW,
        monthlyContribution: MAX_AMOUNT_KRW,
        targetAmount: MAX_AMOUNT_KRW,
        annualRate: 100,
      }).status,
    ).toBe('achieved');

    expect(
      calculateGoalDuration({
        currentAmount: 0,
        monthlyContribution: 1,
        targetAmount: 10,
        annualRate: 100.000_001,
      }),
    ).toEqual({ status: 'invalid', reason: 'annual-rate-exceeds-limit' });
  });
});
