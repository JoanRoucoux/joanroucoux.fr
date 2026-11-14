import en from '../../../../../i18n/site/en.json';
import fr from '../../../../../i18n/site/fr.json';
import { EXPERIENCES } from './experiences';

describe('EXPERIENCES', () => {
  const languages = { fr: fr.home.experiences.items, en: en.home.experiences.items } as Record<
    string,
    Record<string, Record<string, unknown>>
  >;

  describe.each(Object.keys(languages))('%s copy', (lang) => {
    it.each(EXPERIENCES.map((experience) => [experience.id, experience] as const))(
      'should hold as many sentences and figures as %s declares',
      (id, experience) => {
        const item = languages[lang]![id]!;
        const counts = { points: experience.points, details: experience.details, facts: experience.facts };

        for (const [group, count] of Object.entries(counts)) {
          const keys = group in item ? Object.keys(item[group] as object) : [];
          expect(keys, `${lang}.${id}.${group}`).toEqual(
            Array.from({ length: count }, (_, index) => String(index + 1)),
          );
          expect(group in item, `${lang}.${id}.${group} presence`).toBe(count > 0);
        }
      },
    );
  });
});
