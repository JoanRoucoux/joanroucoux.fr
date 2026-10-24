import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { firstValueFrom } from 'rxjs';

import en from '../../../i18n/en.json';
import fr from '../../../i18n/fr.json';
import siteEn from '../../../i18n/site/en.json';
import siteFr from '../../../i18n/site/fr.json';
import { TranslocoBundledLoader } from './transloco-loader';

describe('TranslocoBundledLoader', () => {
  let loader: TranslocoBundledLoader;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    loader = TestBed.inject(TranslocoBundledLoader);
  });

  it('should emit the bundled French translations', async () => {
    expect(await firstValueFrom(loader.getTranslation('fr'))).toEqual(fr);
  });

  it('should emit the bundled English translations', async () => {
    expect(await firstValueFrom(loader.getTranslation('en'))).toEqual(en);
  });

  it('should emit the scoped bundles', async () => {
    expect(await firstValueFrom(loader.getTranslation('site/fr'))).toEqual(siteFr);
    expect(await firstValueFrom(loader.getTranslation('site/en'))).toEqual(siteEn);
  });

  it('should error on an unknown path', async () => {
    await expect(firstValueFrom(loader.getTranslation('de'))).rejects.toThrow('de');
  });
});
