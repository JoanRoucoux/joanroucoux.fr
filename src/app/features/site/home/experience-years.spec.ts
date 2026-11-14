import { CAREER_START, fullYearsSince } from './experience-years';

describe('fullYearsSince', () => {
  it.each([
    [new Date(2026, 10, 14), 8],
    [new Date(2027, 7, 31), 8],
    [new Date(2027, 8, 1), 9],
  ])('should count full years since the start (%s)', (now, years) => {
    expect(fullYearsSince(CAREER_START, now)).toBe(years);
  });
});
