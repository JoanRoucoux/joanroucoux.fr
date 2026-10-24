import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';

import { TranslocoService } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { PageHead } from '@core/seo/page-head';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { langResolver } from './lang-resolver';

describe('langResolver', () => {
  let translocoService: TranslocoService;

  const run = (lang: string): Promise<unknown> =>
    TestBed.runInInjectionContext(() =>
      langResolver({ data: { lang, page: 'home' } } as unknown as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Promise<unknown>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModule()],
      providers: [provideZonelessChangeDetection()],
    });
    translocoService = TestBed.inject(TranslocoService);
  });

  it('should load the language of the route before activating it', async () => {
    const translation = new Subject<object>();
    const loadSpy = vi.spyOn(translocoService, 'load').mockReturnValue(translation);
    const settled = vi.fn();

    const pending = run('fr').then(settled);
    await Promise.resolve();

    expect(loadSpy).toHaveBeenCalledWith('fr');
    expect(settled).not.toHaveBeenCalled();
    expect(translocoService.getActiveLang()).toBe('en');

    translation.next({});
    await pending;

    expect(settled).toHaveBeenCalledWith('fr');
    expect(translocoService.getActiveLang()).toBe('fr');
  });

  it('should activate the English language', async () => {
    const loadSpy = vi.spyOn(translocoService, 'load');
    translocoService.setActiveLang('fr');

    await expect(run('en')).resolves.toBe('en');

    expect(loadSpy).toHaveBeenCalledWith('en');
    expect(translocoService.getActiveLang()).toBe('en');
  });

  it('should apply the head of the route page once the language is active', async () => {
    const applySpy = vi.spyOn(TestBed.inject(PageHead), 'apply');

    await run('en');

    expect(applySpy).toHaveBeenCalledWith('en', 'home');
  });
});
