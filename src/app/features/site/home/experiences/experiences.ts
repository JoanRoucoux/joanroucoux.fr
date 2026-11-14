import type { TechId } from '../tech/tech';

export type Experience = {
  readonly id: 'cdc' | 'sgLead' | 'sgDev' | 'orange' | 'cesi';
  readonly logo: 'cdc' | 'sg' | 'orange' | 'cap';
  readonly points: number;
  readonly details: number;
  readonly facts: number;
  readonly techs: readonly TechId[];
};

export const EXPERIENCES: readonly Experience[] = [
  {
    id: 'cdc',
    logo: 'cdc',
    points: 3,
    details: 4,
    facts: 2,
    techs: [
      'angular',
      'typescript',
      'storybook',
      'java',
      'springBoot',
      'kafka',
      'postgresql',
      'helm',
      'gitlab',
      'kibana',
      'claude',
    ],
  },
  {
    id: 'sgLead',
    logo: 'sg',
    points: 3,
    details: 5,
    facts: 2,
    techs: ['react', 'reactNative', 'typescript', 'storybook', 'java', 'springBoot', 'jenkins', 'sonarqube', 'kibana'],
  },
  {
    id: 'sgDev',
    logo: 'sg',
    points: 2,
    details: 0,
    facts: 1,
    techs: ['react', 'reactNative', 'redux', 'java', 'nodejs', 'jest'],
  },
  { id: 'orange', logo: 'orange', points: 2, details: 0, facts: 0, techs: ['angular', 'nodejs', 'php'] },
  { id: 'cesi', logo: 'cap', points: 0, details: 0, facts: 0, techs: [] },
];
