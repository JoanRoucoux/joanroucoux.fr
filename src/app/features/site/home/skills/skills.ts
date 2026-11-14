import type { TechId } from '../tech/tech';

export type SkillRowId = 'front' | 'back' | 'design' | 'quality' | 'ai' | 'methods';

export const SKILL_ROWS: readonly { id: SkillRowId; techs: readonly TechId[] }[] = [
  { id: 'front', techs: ['angular', 'typescript', 'react', 'reactNative', 'redux'] },
  {
    id: 'back',
    techs: ['java', 'springBoot', 'kafka', 'postgresql', 'nodejs', 'graphql', 'mongodb', 'hexagonal'],
  },
  { id: 'design', techs: ['figma', 'designSystem', 'storybook', 'tailwind', 'accessibility'] },
  {
    id: 'quality',
    techs: [
      'junit',
      'mockito',
      'jest',
      'playwright',
      'sonarqube',
      'gitlabCi',
      'githubActions',
      'jenkins',
      'docker',
      'helm',
      'kibana',
      'aws',
    ],
  },
  { id: 'ai', techs: ['claudeCode', 'skillsMcp', 'copilot', 'mistral'] },
  { id: 'methods', techs: ['scrum', 'safe', 'codeReview', 'gdpr'] },
];
