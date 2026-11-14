import { provideZonelessChangeDetection } from '@angular/core';

import { render, screen } from '@testing-library/angular';

import { SiteHomeSectionHead } from './site-home-section-head';

describe('SiteHomeSectionHead', () => {
  it('should render the title as a level 2 heading and the lede under it', async () => {
    await render(SiteHomeSectionHead, {
      inputs: { title: 'Skills', lede: 'What I work with', index: 1 },
      providers: [provideZonelessChangeDetection()],
    });

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Skills');
    expect(screen.getByTestId('lede')).toHaveTextContent('What I work with');
  });
});
