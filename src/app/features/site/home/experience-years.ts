export const CAREER_START = new Date(2018, 8, 1);

export const fullYearsSince = (start: Date, now: Date): number => {
  const years = now.getFullYear() - start.getFullYear();
  const anniversaryPassed =
    now.getMonth() > start.getMonth() || (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate());
  return anniversaryPassed ? years : years - 1;
};
