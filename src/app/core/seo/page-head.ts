import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { TranslocoService } from '@jsverse/transloco';

import { DEFAULT_LANG, SITE_LANGS, type SiteLang, type SitePageKey } from '@core/i18n/site-lang';

import { SITE_PATHS } from '@features/site/contract/site-paths';

export const SITE_ORIGIN = 'https://joanroucoux.fr';

export type PageKey = SitePageKey | 'not-found';

const LOCALES: Record<SiteLang, string> = { fr: 'fr_FR', en: 'en_US' };

const url = (lang: SiteLang, page: SitePageKey): string => `${SITE_ORIGIN}/${SITE_PATHS[page][lang]}`;

@Injectable({ providedIn: 'root' })
export class PageHead {
  #title = inject(Title);
  #meta = inject(Meta);
  #document = inject(DOCUMENT);
  #translocoService = inject(TranslocoService);

  readonly title = signal('');

  apply(lang: SiteLang, page: PageKey): void {
    const title = this.#translocoService.translate(this.#titleKey(page), {}, lang);

    this.title.set(title);
    this.#title.setTitle(title);
    this.#setMeta('property', 'og:title', title);
    this.#setMeta('property', 'og:type', 'website');
    this.#setMeta('property', 'og:site_name', 'Joan Roucoux');
    this.#setMeta('property', 'og:locale', LOCALES[lang]);
    this.#setMeta('name', 'twitter:card', 'summary_large_image');
    this.#setMeta('property', 'og:image', `${SITE_ORIGIN}/social/og-${lang}.png`);
    this.#setMeta('name', 'twitter:image', `${SITE_ORIGIN}/social/og-${lang}.png`);
    this.#setMeta('name', 'robots', page === 'home' ? undefined : 'noindex');

    if (page === 'not-found') {
      this.#setMeta('name', 'description', undefined);
      this.#setMeta('property', 'og:description', undefined);
      this.#setMeta('property', 'og:url', undefined);
      this.#setLinks(undefined);
      return;
    }

    const description = this.#translocoService.translate(`meta.${page}.description`, {}, lang);

    this.#setMeta('name', 'description', description);
    this.#setMeta('property', 'og:description', description);
    this.#setMeta('property', 'og:url', url(lang, page));
    this.#setLinks({ lang, page });
  }

  #titleKey(page: PageKey): string {
    return page === 'not-found' ? 'meta.notFound.title' : `meta.${page}.title`;
  }

  #setMeta(attribute: 'name' | 'property', key: string, content: string | undefined): void {
    const selector = `${attribute}="${key}"`;

    if (content === undefined) {
      this.#meta.removeTag(selector);
    } else {
      this.#meta.updateTag({ [attribute]: key, content }, selector);
    }
  }

  #setLinks(target: { lang: SiteLang; page: SitePageKey } | undefined): void {
    const head = this.#document.head;

    head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]').forEach((link) => link.remove());

    if (!target) {
      return;
    }

    this.#addLink('canonical', undefined, url(target.lang, target.page));
    SITE_LANGS.forEach((lang) => this.#addLink('alternate', lang, url(lang, target.page)));
    this.#addLink('alternate', 'x-default', url(DEFAULT_LANG, target.page));
  }

  #addLink(rel: string, hreflang: string | undefined, href: string): void {
    const link = this.#document.createElement('link');

    link.setAttribute('rel', rel);
    if (hreflang) {
      link.setAttribute('hreflang', hreflang);
    }
    link.setAttribute('href', href);
    this.#document.head.appendChild(link);
  }
}
