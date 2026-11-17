import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist/joanroucoux-fr/browser';

const failures = [];

const fail = (message) => {
  failures.push(message);
};

const read = (path) => {
  try {
    return readFileSync(join(root, path), 'utf8');
  } catch {
    fail(`${path} is missing`);
    return '';
  }
};

const expectIncludes = (path, html, needle) => {
  if (!html.includes(needle)) fail(`${path} does not contain ${needle}`);
};

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlFiles(full);
    return full.endsWith('.html') ? [full] : [];
  });

const home = read('index.html');
expectIncludes('index.html', home, '<html lang="fr"');
expectIncludes('index.html', home, '<title>Joan Roucoux, développeur full stack senior freelance</title>');
if (!/<h1[^>]*>\s*Joan Roucoux\s*<\/h1>/.test(home)) fail('index.html has no h1 "Joan Roucoux"');

const english = read('en/index.html');
expectIncludes('en/index.html', english, '<html lang="en"');
expectIncludes('en/index.html', english, '<title>Joan Roucoux, freelance senior full stack developer</title>');

expectIncludes('index.html', home, 'Développeur full stack senior, freelance');
expectIncludes('en/index.html', english, 'Senior full stack developer, freelance');

const sections = {
  fr: ['competences', 'projets', 'experiences', 'certifications', 'articles', 'contact'],
  en: ['skills', 'projects', 'experience', 'certifications', 'articles', 'contact'],
};
const hiddenCard = { fr: 'Raccourcisseur d’URL', en: 'URL shortener' };

for (const [path, html, lang] of [
  ['index.html', home, 'fr'],
  ['en/index.html', english, 'en'],
]) {
  const flat = html.match(/data-fluid="flat"/g)?.length ?? 0;
  if (flat !== 3) fail(`${path} has ${flat} data-fluid="flat", expected 3`);
  for (const [, attributes] of html.matchAll(/<h2\b([^>]*)>/g)) {
    if (/\bclass="[^"]*\bon\b[^"]*"/.test(attributes)) fail(`${path} has an h2 drawn as on (${attributes.trim()})`);
  }
  for (const id of sections[lang]) {
    if (!new RegExp(`\\sid="${id}"`).test(html)) fail(`${path} has no element with id "${id}"`);
  }
  const card = new RegExp(`<h3[^>]*\\sid="project-title-shortener"[^>]*>\\s*${hiddenCard[lang]}\\s*</h3>`);
  if (!card.test(html)) fail(`${path} has no hidden project card titled "${hiddenCard[lang]}"`);
}

for (const image of ['social/og-fr.png', 'social/og-en.png']) {
  if (!existsSync(join(root, image))) fail(`${image} is missing`);
}

for (const [path, html] of [
  ['index.html', home],
  ['en/index.html', english],
]) {
  if (html.includes('noindex')) fail(`${path} must be indexable but contains noindex`);
  expectIncludes(path, html, 'rel="canonical"');
  expectIncludes(path, html, 'hreflang="x-default"');
}

for (const [path, lang] of [
  ['mentions-legales/index.html', 'fr'],
  ['en/legal/index.html', 'en'],
  ['404/index.html', 'fr'],
]) {
  const html = read(path);
  expectIncludes(path, html, 'noindex');
  expectIncludes(path, html, `<html lang="${lang}"`);
}

if (read('404/index.html').includes('rel="canonical"')) fail('404/index.html must not declare a canonical');

for (const file of htmlFiles(root)) {
  const html = readFileSync(file, 'utf8');
  const name = file.slice(root.length + 1);
  if (html.includes('[[')) fail(`${name} contains an unresolved [[`);
  const untranslated = html.match(/(>\s*|=")site\.[a-z][\w.]*/);
  if (untranslated) fail(`${name} contains an untranslated key (${untranslated[0].replace(/^(>\s*|=")/, '')})`);
  if (html.includes('https://www.google.com/')) fail(`${name} contains a temporary link`);
  for (const [, source] of html.matchAll(/\ssrc="(\/images\/[^"]*)"/g)) {
    if (!existsSync(join(root, source.split(/[?#]/)[0]))) fail(`${name} references a missing image (${source})`);
  }
  for (const host of ['fonts.googleapis.com', 'fonts.gstatic.com']) {
    if (html.includes(host)) fail(`${name} references ${host}`);
  }
  const handler = html.match(/<[^>]*\son[a-z]+\s*=/i);
  if (handler) fail(`${name} has an inline event handler (${handler[0].slice(-40).trim()})`);
  for (const [tag] of html.matchAll(/<script\b[^>]*>/gi)) {
    if (!/\ssrc=/.test(tag) && !/type="application\/json"/.test(tag)) {
      fail(`${name} has an executable inline script (${tag})`);
    }
  }
}

if (failures.length > 0) {
  for (const message of failures) console.error(`check-prerender: ${message}`);
  process.exit(1);
}

console.log('check-prerender: ok');
