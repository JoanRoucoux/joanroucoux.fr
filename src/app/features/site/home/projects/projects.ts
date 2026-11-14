import type { TechId } from '../tech/tech';

export type CairnScreen = 'dashboard' | 'allocation' | 'holding';
export type ProjectId = 'starters' | 'infra' | 'shortener' | 'subtitles';

export const CAIRN: { readonly techs: readonly TechId[]; readonly screens: readonly CairnScreen[] } = {
  techs: ['angular', 'springBoot', 'java', 'kafka', 'postgresql'],
  screens: ['dashboard', 'allocation', 'holding'],
};

export const PROJECT_CARDS: readonly { id: ProjectId; techs: readonly TechId[]; more: boolean }[] = [
  { id: 'starters', techs: ['angular', 'react', 'springBoot'], more: false },
  { id: 'infra', techs: ['terraform', 'ansible', 'docker', 'caddy'], more: false },
  { id: 'shortener', techs: ['nodejs', 'mongodb', 'redis', 'nginx', 'docker'], more: true },
  { id: 'subtitles', techs: ['react', 'vite', 'shadcn', 'zod'], more: true },
];
