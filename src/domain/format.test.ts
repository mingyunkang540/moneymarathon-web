import { describe, expect, it } from 'vitest'
import { arrivalMonth, formatAmount, formatDuration, parseInput } from './format'

describe('user-facing formats', () => {
  it('formats Korean units and periods', () => {
    expect(formatAmount(30_000_000)).toBe('3,000만원')
    expect(formatAmount(100_000_000)).toBe('1억원')
    expect(formatAmount(130_000_000)).toBe('1억 3,000만원')
    expect(formatDuration(40)).toBe('3년 4개월')
    expect(formatDuration(12)).toBe('1년')
    expect(formatDuration(0)).toBe('이미 목표 달성')
  })
  it('handles month arithmetic at year end without day overflow', () => {
    expect(arrivalMonth(1, new Date(2026, 11, 31))).toBe('2027년 1월')
    expect(arrivalMonth(40, new Date(2026, 9, 5))).toBe('2030년 2월')
  })
  it('accepts formatted inputs and rejects dangerous or malformed notation', () => {
    expect(parseInput('3,000')).toBe(3000)
    expect(parseInput('5.25')).toBe(5.25)
    for (const value of ['', '-1', 'Infinity', 'NaN', '1e4', '3,00', '3,,000', '0xFF', '1,5']) expect(parseInput(value)).toBeNaN()
  })
})

