import { HOME_LINKS } from '../site-home-links';
import type { TechId } from '../tech/tech';

export type ArticleId = 'subtitles' | 'shortener' | 'readme' | 'marvel';

export const ARTICLES: readonly { id: ArticleId; url: string; techs: readonly TechId[] }[] = [
  {
    id: 'subtitles',
    url: HOME_LINKS.articles.subtitles,
    techs: ['react', 'vite', 'shadcn', 'reactHookForm', 'zod'],
  },
  {
    id: 'shortener',
    url: HOME_LINKS.articles.shortener,
    techs: ['nodejs', 'mongodb', 'redis', 'nginx', 'docker'],
  },
  { id: 'readme', url: HOME_LINKS.articles.readme, techs: ['githubActions', 'deno', 'typescript'] },
  { id: 'marvel', url: HOME_LINKS.articles.marvel, techs: ['qwik', 'tailwind'] },
];
