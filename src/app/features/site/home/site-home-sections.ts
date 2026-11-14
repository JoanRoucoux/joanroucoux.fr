import { type SiteLang } from '@core/i18n/site-lang';

export type HomeSectionId = 'skills' | 'projects' | 'experiences' | 'certifications' | 'articles' | 'contact';

export const HOME_SECTIONS: Record<HomeSectionId, Record<SiteLang, string>> = {
  skills: { fr: 'competences', en: 'skills' },
  projects: { fr: 'projets', en: 'projects' },
  experiences: { fr: 'experiences', en: 'experience' },
  certifications: { fr: 'certifications', en: 'certifications' },
  articles: { fr: 'articles', en: 'articles' },
  contact: { fr: 'contact', en: 'contact' },
};
