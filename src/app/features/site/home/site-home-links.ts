export const HOME_LINKS = {
  email: 'joan.roucoux@gmail.com',
  linkedin: 'https://www.linkedin.com/in/joanroucoux/',
  github: 'https://github.com/JoanRoucoux',
  devto: 'https://dev.to/joanroucoux',
  cv: '/cv/joan-roucoux.pdf',
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
    safe: 'https://www.credly.com/badges/7b2ea63c-efd3-4d3c-bdbf-e05430d1dcee',
    aws: 'https://www.credly.com/badges/913d05ed-2c20-42a2-bcfa-33fb38cebb6d',
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
  certifications: Record<'safe' | 'aws', string>;
};
