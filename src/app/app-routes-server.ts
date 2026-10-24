import { RenderMode, type ServerRoute } from '@angular/ssr';

import { SITE_PATHS } from '@features/site/contract/site-paths';

import { NOT_FOUND_PATH } from './app-routes';

export const serverRoutes: ServerRoute[] = [
  { path: SITE_PATHS.home.fr, renderMode: RenderMode.Prerender },
  { path: SITE_PATHS.home.en, renderMode: RenderMode.Prerender },
  { path: SITE_PATHS.legal.fr, renderMode: RenderMode.Prerender },
  { path: SITE_PATHS.legal.en, renderMode: RenderMode.Prerender },
  { path: NOT_FOUND_PATH, renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Client },
];
