import { availabilityBadge } from './availability';

describe('availabilityBadge', () => {
  it('should describe each availability state', () => {
    expect(availabilityBadge({ state: 'mission' }, 'fr')).toEqual({
      key: 'site.home.hero.badge.mission',
      tone: 'amber',
    });
    expect(availabilityBadge({ state: 'available' }, 'fr')).toEqual({
      key: 'site.home.hero.badge.available',
      tone: 'green',
    });
    expect(availabilityBadge({ state: 'mission', until: '2027-03-31' }, 'fr')).toEqual({
      key: 'site.home.hero.badge.missionUntil',
      date: 'mars 2027',
      tone: 'amber',
    });
    expect(availabilityBadge({ state: 'from', date: '2027-04-01' }, 'en')).toEqual({
      key: 'site.home.hero.badge.from',
      date: 'April 2027',
      tone: 'amber',
    });
  });
});
