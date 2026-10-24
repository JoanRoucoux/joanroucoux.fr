import { DOCUMENT } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { PageHead } from './page-head';

describe('PageHead', () => {
  let pageHead: PageHead;
  let document: Document;

  const content = (selector: string): string | null | undefined =>
    document.head.querySelector(selector)?.getAttribute('content');
  const href = (selector: string): string | null | undefined =>
    document.head.querySelector(selector)?.getAttribute('href');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModule()],
      providers: [provideZonelessChangeDetection()],
    });
    pageHead = TestBed.inject(PageHead);
    document = TestBed.inject(DOCUMENT);
    document.head.innerHTML = '';
  });

  it('should describe the English home page', () => {
    pageHead.apply('en', 'home');

    expect(document.title).toBe('meta.home.title');
    expect(pageHead.title()).toBe('meta.home.title');
    expect(content('meta[name="description"]')).toBe('meta.home.description');
    expect(href('link[rel="canonical"]')).toBe('https://joanroucoux.fr/en');
    expect(href('link[rel="alternate"][hreflang="fr"]')).toBe('https://joanroucoux.fr/');
    expect(href('link[rel="alternate"][hreflang="en"]')).toBe('https://joanroucoux.fr/en');
    expect(href('link[rel="alternate"][hreflang="x-default"]')).toBe('https://joanroucoux.fr/');
    expect(content('meta[property="og:title"]')).toBe('meta.home.title');
    expect(content('meta[property="og:description"]')).toBe('meta.home.description');
    expect(content('meta[property="og:url"]')).toBe('https://joanroucoux.fr/en');
    expect(content('meta[property="og:locale"]')).toBe('en_US');
    expect(content('meta[property="og:type"]')).toBe('website');
    expect(content('meta[property="og:site_name"]')).toBe('Joan Roucoux');
    expect(content('meta[property="og:image"]')).toBe('https://joanroucoux.fr/social/og-en.png');
    expect(content('meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(content('meta[name="twitter:image"]')).toBe('https://joanroucoux.fr/social/og-en.png');
    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('should use the French locale and URLs for the French home page', () => {
    pageHead.apply('fr', 'home');

    expect(content('meta[property="og:locale"]')).toBe('fr_FR');
    expect(href('link[rel="canonical"]')).toBe('https://joanroucoux.fr/');
    expect(content('meta[property="og:image"]')).toBe('https://joanroucoux.fr/social/og-fr.png');
  });

  it('should keep the legal notice out of search engines', () => {
    pageHead.apply('fr', 'legal');

    expect(content('meta[name="robots"]')).toBe('noindex');
    expect(document.title).toBe('meta.legal.title');
    expect(content('meta[name="description"]')).toBe('meta.legal.description');
    expect(content('meta[property="og:description"]')).toBe('meta.legal.description');
    expect(href('link[rel="canonical"]')).toBe('https://joanroucoux.fr/mentions-legales');
    expect(href('link[rel="alternate"][hreflang="en"]')).toBe('https://joanroucoux.fr/en/legal');
  });

  it('should drop noindex when an indexable page follows a legal notice', () => {
    pageHead.apply('fr', 'legal');
    pageHead.apply('fr', 'home');

    expect(document.head.querySelector('meta[name="robots"]')).toBeNull();
  });

  it('should leave one tag of each kind when applied twice', () => {
    pageHead.apply('en', 'home');
    pageHead.apply('fr', 'legal');

    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('link[rel="alternate"]')).toHaveLength(3);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[property="og:title"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[name="robots"]')).toHaveLength(1);
  });

  it('should hide the not found page from search engines and strip its URLs', () => {
    pageHead.apply('fr', 'home');
    pageHead.apply('fr', 'not-found');

    expect(document.title).toBe('meta.notFound.title');
    expect(content('meta[name="robots"]')).toBe('noindex');
    expect(document.head.querySelector('link[rel="canonical"]')).toBeNull();
    expect(document.head.querySelector('link[rel="alternate"]')).toBeNull();
    expect(document.head.querySelector('meta[property="og:url"]')).toBeNull();
    expect(document.head.querySelector('meta[name="description"]')).toBeNull();
    expect(document.head.querySelector('meta[property="og:description"]')).toBeNull();
  });
});
