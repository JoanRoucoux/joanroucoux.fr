import { DOCUMENT } from '@angular/common';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TranslocoService } from '@jsverse/transloco';

import { getTranslocoTestingModule } from '@shared/testing/transloco-testing';

import { LanguageStore } from './language-store';

describe('LanguageStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoTestingModule()],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should follow the active language and update <html lang>', () => {
    const service = TestBed.inject(LanguageStore);
    const translocoService = TestBed.inject(TranslocoService);
    const document = TestBed.inject(DOCUMENT);

    translocoService.setActiveLang('en');
    TestBed.tick();

    expect(service.activeLang()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
