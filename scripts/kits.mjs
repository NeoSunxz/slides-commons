// Builds the two downloadable toolkits (zip/convert-kit.zip and zip/slides-commons-skills.zip) and
// returns the texts the Convert and Skills pages show. Static files live in kits/ (and the files
// listed in kits/kits.json), the texts come from src/kits.mjs. Called by scripts/build.mjs.

import fs from 'node:fs';
import path from 'node:path';
import {
  KIT_SLUG, SKILLS_SLUG, SKILL_NAMES, convertPrompt, deckPrompt, skillMd, skillsInstallPrompt,
  kitReadme, skillsReadme, fontSubstitutionMd,
} from '../src/kits.mjs';

const read = (p) => fs.readFileSync(p);

function walk(dir, base = dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

// [{ name: 'a/b', data }] under a root folder -> entries with the intermediate directory entries.
function withDirs(root, files) {
  const dirs = new Set();
  for (const f of files) {
    const parts = f.name.split('/');
    for (let k = 1; k < parts.length; k++) dirs.add(parts.slice(0, k).join('/') + '/');
  }
  dirs.delete(root);
  const sorted = [...files].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return [{ name: root }, ...[...dirs].sort().map((name) => ({ name })), ...sorted];
}

export function buildKits({ root, site, siteUrl, makeZip, zipTime, writeFile, licenseName, cjkFamilyEntry, cjkRangesJson, fail }) {
  const cfg = JSON.parse(read(path.join(root, 'kits', 'kits.json')));
  const at = (p) => path.join(root, ...p.split('/'));
  for (const p of [cfg.viewportBase, cfg.viewportBaseLicense, cfg.projectLicense, cfg.example.license, ...cfg.example.files.map((f) => `${cfg.example.dir}/${f}`)]) {
    if (!fs.existsSync(at(p))) fail(`kits/kits.json: ${p} does not exist (is the upstream submodule checked out?)`);
  }
  const url = (name) => (siteUrl ? new URL(`zip/${name}.zip`, siteUrl).href : null);

  // ---- shared pieces -----------------------------------------------------------------------
  const convertDir = path.join(root, 'kits', 'convert');
  const fontMap = JSON.parse(read(path.join(convertDir, 'spec', 'font-map.json')));
  const specDocs = ['design-md.md', 'template-json.md', 'extractor.md'];
  // Guard against drift: the template.json reference must mention every schema field.
  const schema = JSON.parse(read(path.join(root, 'src', 'schema', 'template.schema.json')));
  const refText = read(path.join(convertDir, 'spec', 'template-json.md')).toString('utf8');
  for (const k of Object.keys(schema.properties)) {
    if (k !== 'source' && !refText.includes('`' + k + '`')) fail(`kits/convert/spec/template-json.md does not document the template.json field "${k}" (see src/schema/template.schema.json)`);
  }

  const cjk = new Map();
  for (const name of cfg.cjkFamilies) {
    const e = cjkFamilyEntry(root, name);
    if (!e) fail(`kits/kits.json: CJK family "${name}" is not installed (npm install)`);
    cjk.set(name, e);
  }
  const fontsEntries = (prefix) => [
    { name: `${prefix}fonts/embed-cjk.mjs`, data: read(path.join(root, 'src', 'embed-cjk.mjs')) },
    { name: `${prefix}fonts/cjk-ranges.json`, data: Buffer.from(cjkRangesJson(cjk, siteUrl ?? null), 'utf8') },
    ...[...cjk].filter(([, e]) => e.license).map(([, e]) => ({ name: `${prefix}fonts/cjk-licenses/${e.id}-${licenseName({ license: e.license })}`, data: read(e.license) })),
  ];
  const baseEntries = (prefix) => [
    { name: `${prefix}viewport-base.css`, data: read(at(cfg.viewportBase)) },
    { name: `${prefix}LICENSE-skill`, data: read(at(cfg.viewportBaseLicense)) },
  ];
  // tools/, spec/ (static + generated) shared by the kit and the convert skill.
  const toolEntries = (prefix) => {
    const out = [];
    for (const f of walk(path.join(convertDir, 'tools'))) out.push({ name: `${prefix}tools/${f}`, data: read(path.join(convertDir, 'tools', ...f.split('/'))) });
    out.push({ name: `${prefix}spec/font-map.json`, data: read(path.join(convertDir, 'spec', 'font-map.json')) });
    out.push({ name: `${prefix}spec/font-substitution.md`, data: Buffer.from(fontSubstitutionMd(fontMap) + '\n', 'utf8') });
    for (const d of specDocs) out.push({ name: `${prefix}spec/${d}`, data: read(path.join(convertDir, 'spec', d)) });
    for (const f of cfg.example.files) out.push({ name: `${prefix}spec/example/${f}`, data: read(at(`${cfg.example.dir}/${f}`)) });
    out.push({ name: `${prefix}spec/example/LICENSE`, data: read(at(cfg.example.license)) });
    out.push({ name: `${prefix}deck/PROMPT.md`, data: Buffer.from(deckPrompt('en'), 'utf8') });
    out.push({ name: `${prefix}deck/PROMPT.zh.md`, data: Buffer.from(deckPrompt('zh'), 'utf8') });
    return out;
  };
  const license = (prefix) => ({ name: `${prefix}LICENSE`, data: read(at(cfg.projectLicense)) });
  const text = (name, s) => ({ name, data: Buffer.from(s, 'utf8') });

  // ---- convert kit --------------------------------------------------------------------------
  const kz = `${KIT_SLUG}/`;
  const kitPromptEn = convertPrompt('en', { zipUrl: url(KIT_SLUG) });
  const kitPromptZh = convertPrompt('zh', { zipUrl: url(KIT_SLUG) });
  const kitFiles = [
    text(`${kz}PROMPT.md`, kitPromptEn),
    text(`${kz}PROMPT.zh.md`, kitPromptZh),
    text(`${kz}README.md`, kitReadme({ siteUrl })),
    license(kz),
    ...toolEntries(kz),
    ...baseEntries(kz),
    ...fontsEntries(kz),
  ];
  writeFile(path.join(site, 'zip', `${KIT_SLUG}.zip`), makeZip(withDirs(kz, kitFiles), zipTime));

  // ---- skills -------------------------------------------------------------------------------
  const sz = `${SKILLS_SLUG}/`;
  const skillFiles = [
    text(`${sz}README.md`, skillsReadme({ siteUrl })),
    license(sz),
  ];
  for (const name of SKILL_NAMES) {
    const p = `${sz}${name}/`;
    skillFiles.push(text(`${p}SKILL.md`, skillMd(name, { siteUrl })), license(p));
    if (name === 'slides-commons-deck') skillFiles.push(...baseEntries(p), ...fontsEntries(p));
    if (name === 'slides-commons-convert') skillFiles.push(...toolEntries(p), ...baseEntries(p), ...fontsEntries(p));
    if (name === 'slides-commons-cjk-fonts') skillFiles.push(...fontsEntries(p));
  }
  writeFile(path.join(site, 'zip', `${SKILLS_SLUG}.zip`), makeZip(withDirs(sz, skillFiles), zipTime));

  return {
    zips: [`zip/${KIT_SLUG}.zip`, `zip/${SKILLS_SLUG}.zip`],
    convert: { promptEn: kitPromptEn, promptZh: kitPromptZh, exampleFiles: cfg.example.files },
    skills: { installEn: skillsInstallPrompt('en', { zipUrl: url(SKILLS_SLUG) }), installZh: skillsInstallPrompt('zh', { zipUrl: url(SKILLS_SLUG) }) },
  };
}
