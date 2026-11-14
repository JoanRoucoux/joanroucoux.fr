export const TEMPORARY_LINK = 'https://www.google.com/';

export const HOME_LINKS = {
  email: 'joan.roucoux@gmail.com',
  linkedin: 'https://www.linkedin.com/in/joanroucoux/',
  github: 'https://github.com/JoanRoucoux',
  devto: 'https://dev.to/joanroucoux',
  cv: TEMPORARY_LINK,
  cairn: {
    back: 'https://github.com/JoanRoucoux/cairn',
    front: 'https://github.com/JoanRoucoux/cairn-web',
    storybook: 'https://joanroucoux.github.io/cairn-ui/?path=/docs/foundations-overview--docs',
  },
  projects: {
    starters: 'https://github.com/JoanRoucoux/starter-generator',
    infra: 'https://github.com/JoanRoucoux/infra',
    shortener: 'https://github.com/JoanRoucoux/url-shortener-full-app',
    subtitles: 'https://github.com/JoanRoucoux/sub-shifter-app',
  },
  articles: {
    subtitles: 'https://dev.to/joanroucoux/easily-sync-your-subtitles-with-react-rhf-and-shadcnui-3gfe',
    shortener: 'https://dev.to/joanroucoux/building-a-scalable-url-shortener-with-nodejs-part-12-232i',
    readme: 'https://dev.to/joanroucoux/update-readme-with-latest-articles-using-github-actions-41m3',
    marvel: 'https://dev.to/joanroucoux/building-a-marvel-search-application-with-qwik-ll7',
  },
  certifications: {
    safe: TEMPORARY_LINK,
    aws: TEMPORARY_LINK,
    psm: TEMPORARY_LINK,
  },
} satisfies {
  email: string;
  linkedin: string;
  github: string;
  devto: string;
  cv: string;
  cairn: { back: string; front: string; storybook: string };
  projects: Record<'starters' | 'infra' | 'shortener' | 'subtitles', string>;
  articles: Record<'subtitles' | 'shortener' | 'readme' | 'marvel', string>;
  certifications: Record<'safe' | 'aws' | 'psm', string>;
};
