// M5 contribution files: CONTRIBUTING.md, README link, PR template, issue forms, and the CI guard job.
// Text / YAML checks only (the YAML parser is the one bundled with Playwright; no extra dependency),
// plus a behavioural run of the guard script against a throwaway git repo (skipped on Windows: it needs bash).
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { test, expect } from '@playwright/test';
import { ROOT } from './helpers.mjs';
import { makeRoot } from './fixture-factory.mjs';

const require = createRequire(import.meta.url);
const { yaml } = require('playwright-core/lib/utilsBundle');
const readRoot = (...p) => fs.readFileSync(path.join(ROOT, ...p), 'utf8');
const parseYaml = (...p) => yaml.parse(readRoot(...p));
const CJK = /[㐀-鿿＀-￯　-〿]/;

// ---------------------------------------------------------------------------
// CONTRIBUTING.md and README
// ---------------------------------------------------------------------------
test.describe('CONTRIBUTING.md', () => {
  const md = readRoot('CONTRIBUTING.md');
  const lines = md.split(/\r?\n/);
  const zhAt = lines.findIndex((l) => /^# 贡献指南\s*$/.test(l));
  const en = lines.slice(0, zhAt);
  const zh = lines.slice(zhAt);
  const headings = (ls) => ls.filter((l) => /^##\s/.test(l)).map((l) => l.replace(/^##\s+/, ''));

  test('has an English part and a 贡献指南 part; the title is slides-commons', () => {
    expect(lines[0]).toMatch(/^# Contributing to slides-commons$/);
    expect(zhAt, 'a "# 贡献指南" heading').toBeGreaterThan(5);
    expect(md).not.toMatch(/frontend-slides-gallery|beautiful-html-templates (gallery|site)/i);
  });

  test('the two parts cover the same sections, in the same order', () => {
    expect(headings(en).length).toBeGreaterThanOrEqual(6);
    expect(headings(zh)).toHaveLength(headings(en).length);
  });

  test('the English part has no Chinese except the link to the Chinese part; the Chinese part has Chinese prose', () => {
    const offending = en.filter((l) => CJK.test(l) && !/\[贡献指南\]\(#贡献指南\)/.test(l));
    expect(offending, 'English lines containing CJK').toEqual([]);
    expect(zh.join('\n').match(/[一-鿿]/g)?.length ?? 0).toBeGreaterThan(300);
    // The anchor link resolves to the Chinese heading.
    expect(md).toContain('(#贡献指南)');
  });

  test('every `npm run <script>` it mentions exists in package.json', () => {
    const scripts = JSON.parse(readRoot('package.json')).scripts;
    const used = new Set([...md.matchAll(/npm run ([a-z][\w:-]*)/g)].map((m) => m[1]));
    expect(used.size).toBeGreaterThan(3);
    for (const name of used) expect(scripts, `npm run ${name}`).toHaveProperty([name]);
    expect(used.has('new-template')).toBe(true);
    expect(used.has('validate')).toBe(true);
  });

  test('states the licenses the checks allow, the dev branch, and the read-only upstream rule', () => {
    for (const l of ['MIT', 'Apache-2.0', 'CC-BY-4.0', 'CC0-1.0']) expect(md, l).toContain(l);
    expect(md).toMatch(/`dev`/);
    expect(md).toMatch(/upstream\//);
    expect(md).toMatch(/derivedFrom/);
    expect(md).toMatch(/Conventional Commits/i);
  });

  test('relative links point at files that exist', () => {
    const bad = [];
    for (const m of md.matchAll(/\]\((?!https?:|#|mailto:)([^)\s#]+)(?:#[^)]*)?\)/g)) {
      if (!fs.existsSync(path.join(ROOT, ...m[1].split('/')))) bad.push(m[1]);
    }
    expect(bad).toEqual([]);
  });

  test('README links to CONTRIBUTING.md', () => {
    expect(readRoot('README.md')).toMatch(/\]\(CONTRIBUTING\.md\)/);
  });
});

// ---------------------------------------------------------------------------
// PR template and issue forms
// ---------------------------------------------------------------------------
test.describe('GitHub templates', () => {
  test('pull request template has the license / credit / CJK / fictional-content checklist', () => {
    const t = readRoot('.github', 'PULL_REQUEST_TEMPLATE.md');
    expect(t.match(/^- \[ \]/gm)?.length ?? 0).toBeGreaterThanOrEqual(8);
    for (const re of [/targets `dev`/, /npm run validate/, /npm test/, /npm run screenshots/, /License and credit/i, /derivedFrom/, /CJK/, /fictional/i, /upstream\//]) expect(t).toMatch(re);
  });

  const forms = ['bug_report.yml', 'prompt_feedback.yml', 'template_proposal.yml'];
  for (const f of forms) {
    test(`issue form ${f} parses and has the required keys`, () => {
      const y = parseYaml('.github', 'ISSUE_TEMPLATE', f);
      for (const k of ['name', 'description', 'body']) expect(y, k).toHaveProperty([k]);
      expect(typeof y.name).toBe('string');
      expect(typeof y.description).toBe('string');
      if (y.title != null) expect(typeof y.title).toBe('string');
      if (y.labels != null) expect(Array.isArray(y.labels)).toBe(true);
      expect(Array.isArray(y.body) && y.body.length).toBeGreaterThan(0);
      const ids = [];
      let inputs = 0;
      for (const [i, item] of y.body.entries()) {
        expect(['markdown', 'textarea', 'input', 'dropdown', 'checkboxes'], `body[${i}].type`).toContain(item.type);
        expect(item.attributes, `body[${i}].attributes`).toBeTruthy();
        if (item.type === 'markdown') { expect(typeof item.attributes.value, `body[${i}] markdown value`).toBe('string'); continue; }
        inputs++;
        expect(typeof item.attributes.label, `body[${i}].attributes.label`).toBe('string');
        if (item.type !== 'checkboxes') {
          expect(typeof item.id, `body[${i}].id`).toBe('string');
          expect(item.id).toMatch(/^[A-Za-z0-9_-]+$/);
          ids.push(item.id);
        }
        if (item.type === 'dropdown') expect(Array.isArray(item.attributes.options) && item.attributes.options.length, `body[${i}] dropdown options`).toBeGreaterThan(1);
        if (item.validations) expect(typeof item.validations.required).toBe('boolean');
      }
      expect(new Set(ids).size, `duplicate ids in ${f}: ${ids}`).toBe(ids.length);
      expect(inputs).toBeGreaterThan(1);
      // At least one required field so that empty reports cannot be filed.
      expect(y.body.some((b) => b.validations?.required === true), `${f}: a required field`).toBe(true);
    });
  }

  test('prompt feedback form asks for slug, agent and prompt language (required)', () => {
    const y = parseYaml('.github', 'ISSUE_TEMPLATE', 'prompt_feedback.yml');
    const by = Object.fromEntries(y.body.filter((b) => b.id).map((b) => [b.id, b]));
    for (const id of ['slug', 'agent', 'lang', 'happened']) expect(by[id]?.validations?.required, `${id} required`).toBe(true);
    expect(by.lang.attributes.options).toEqual(['English', 'Chinese']);
  });

  test('issue config: blank issues disabled; contact links (if any) are https URLs', () => {
    const y = parseYaml('.github', 'ISSUE_TEMPLATE', 'config.yml');
    expect(y.blank_issues_enabled).toBe(false);
    for (const c of y.contact_links ?? []) {
      expect(typeof c.name).toBe('string');
      expect(c.url).toMatch(/^https:\/\//);
      expect(typeof c.about).toBe('string');
    }
  });

  test('forms link to CONTRIBUTING.md on the dev branch, not to a missing file', () => {
    const all = forms.map((f) => readRoot('.github', 'ISSUE_TEMPLATE', f)).join('\n');
    for (const m of all.matchAll(/https:\/\/github\.com\/NeoSunxz\/slides-commons\/blob\/(\w+)\/([\w./-]+)/g)) {
      expect(m[1], `branch in ${m[0]}`).toBe('dev');
      expect(fs.existsSync(path.join(ROOT, ...m[2].split('/'))), m[2]).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// CI guard job
// ---------------------------------------------------------------------------
test.describe('ci.yml guard job', () => {
  const ci = parseYaml('.github', 'workflows', 'ci.yml');
  const guard = ci.jobs?.guard;

  test('exists, runs only for pull_request events, with a timeout', () => {
    expect(guard, 'jobs.guard').toBeTruthy();
    expect(guard.if).toMatch(/github\.event_name\s*==\s*'pull_request'/);
    expect(guard['timeout-minutes']).toBeGreaterThan(0);
    expect(ci.jobs.test, 'the validate + test job is still there').toBeTruthy();
    expect(ci.jobs.test.name).toBe('validate + test');
  });

  test('read-only permissions: top-level contents: read, no job grants more', () => {
    expect(ci.permissions).toEqual({ contents: 'read' });
    for (const [name, job] of Object.entries(ci.jobs)) {
      if (!job.permissions) continue;
      for (const [k, v] of Object.entries(job.permissions)) expect(['read', 'none'], `job ${name} permission ${k}`).toContain(v);
    }
    expect(JSON.stringify(ci)).not.toMatch(/write/);
  });

  test('every action in the file is pinned to a 40-hex SHA, including the guard checkout', () => {
    for (const [name, job] of Object.entries(ci.jobs)) {
      for (const s of job.steps ?? []) {
        if (!s.uses) continue;
        expect(s.uses, `job ${name}: ${s.uses}`).toMatch(/@[0-9a-f]{40}$/);
      }
    }
    const checkout = guard.steps.find((s) => /^actions\/checkout@/.test(s.uses ?? ''));
    expect(checkout, 'guard checks out the repo').toBeTruthy();
    expect(checkout.with['persist-credentials'], 'persist-credentials: false').toBe(false);
    expect(checkout.with['fetch-depth'], 'full history for the three-dot diff').toBe(0);
    expect(checkout.with.submodules, 'the guard needs no submodules').toBeUndefined();
  });

  test('untrusted PR fields reach the script only through env, never interpolated into run:', () => {
    for (const [name, job] of Object.entries(ci.jobs)) {
      for (const s of job.steps ?? []) {
        if (!s.run) continue;
        expect(s.run, `job ${name} step ${s.name}: \${{ }} expressions inside run:`).not.toMatch(/\$\{\{/);
      }
    }
    const step = guard.steps.find((s) => s.run);
    expect(Object.keys(step.env)).toEqual(expect.arrayContaining(['BASE_REF', 'PR_AUTHOR', 'OWNER']));
  });

  test('the guard runs no code from the PR (no npm / node / scripts)', () => {
    for (const s of guard.steps) {
      if (s.run) expect(s.run).not.toMatch(/\b(npm|npx|node|yarn|pnpm|python3?)\b|\.\/scripts|scripts\//);
      if (s.uses) expect(s.uses).not.toMatch(/setup-node|cache@/);
    }
  });

  test('triggers use pull_request (not pull_request_target) for dev and main', () => {
    expect(ci.on.pull_request.branches.sort()).toEqual(['dev', 'main']);
    expect(ci.on).not.toHaveProperty('pull_request_target');
  });

  // Behaviour: run the real script text against a throwaway repo.
  test.describe('behaviour (bash + git, not on Windows)', () => {
    test.skip(process.platform === 'win32', 'the guard script is bash');
    const script = guard?.steps.find((s) => s.run)?.run;

    function repoWith(files) {
      const dir = makeRoot('sc-guard-repo-');
      const git = (...a) => {
        const r = spawnSync('git', a, { cwd: dir, encoding: 'utf8', env: { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@example.com', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@example.com', GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null' } });
        if (r.status !== 0) throw new Error(`git ${a.join(' ')}: ${r.stderr}`);
        return r.stdout.trim();
      };
      const put = (rel, text) => { const p = path.join(dir, ...rel.split('/')); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, text); };
      git('init', '-q', '-b', 'main');
      put('README.md', 'base\n');
      put('upstream/templates/a.txt', 'a\n');
      put('collections/style-presets/templates/x/template.json', '{}\n');
      put('collections/community/templates/.gitkeep', '');
      git('add', '-A'); git('commit', '-q', '-m', 'base');
      git('update-ref', 'refs/remotes/origin/main', 'HEAD');
      git('checkout', '-q', '-b', 'pr');
      for (const [rel, text] of Object.entries(files)) put(rel, text);
      git('add', '-A'); git('commit', '-q', '-m', 'pr');
      return dir;
    }
    function runGuard(dir, { author = 'someone', owner = 'NeoSunxz' } = {}) {
      const summary = path.join(dir, '.summary.md');
      fs.writeFileSync(summary, '');
      const r = spawnSync('bash', ['-c', script], {
        cwd: dir, encoding: 'utf8',
        env: { ...process.env, BASE_REF: 'main', PR_AUTHOR: author, OWNER: owner, GITHUB_STEP_SUMMARY: summary },
      });
      return { status: r.status, out: `${r.stdout}\n${r.stderr}`, summary: fs.readFileSync(summary, 'utf8') };
    }
    const dirs = [];
    test.afterAll(() => { for (const d of dirs) fs.rmSync(d, { recursive: true, force: true }); });
    const mk = (f) => { const d = repoWith(f); dirs.push(d); return d; };

    test('a PR that changes upstream/ from a non-owner fails and names the file', () => {
      const r = runGuard(mk({ 'upstream/templates/a.txt': 'changed\n' }));
      expect(r.status, r.out).toBe(1);
      expect(r.out).toMatch(/::error::.*upstream\//);
      expect(r.out).toContain('upstream/templates/a.txt');
    });
    test('adding a new file under upstream/ also fails', () => {
      expect(runGuard(mk({ 'upstream/skill/new.md': 'x\n' })).status).toBe(1);
    });
    test('the repository owner may change upstream/ (submodule bumps)', () => {
      const r = runGuard(mk({ 'upstream/templates/a.txt': 'changed\n' }), { author: 'NeoSunxz' });
      expect(r.status, r.out).toBe(0);
    });
    test('a path that merely starts with "upstream" (upstreamish/) is not blocked', () => {
      expect(runGuard(mk({ 'upstreamish/file.txt': 'x\n' })).status).toBe(0);
    });
    test('a community-only PR passes without a warning', () => {
      const r = runGuard(mk({ 'collections/community/templates/my-deck/template.json': '{}\n' }));
      expect(r.status, r.out).toBe(0);
      expect(r.out).not.toMatch(/::warning::/);
      expect(r.summary).toMatch(/No changes to upstream\//);
    });
    test('editing another source\'s template passes but is flagged with a warning and a summary line', () => {
      const r = runGuard(mk({ 'collections/style-presets/templates/x/template.json': '{"a":1}\n' }));
      expect(r.status, r.out).toBe(0);
      expect(r.out).toMatch(/::warning::.*outside collections\/community\//);
      expect(r.summary).toContain('collections/style-presets/templates/x/template.json');
    });
    test('docs-only PR passes', () => {
      const r = runGuard(mk({ 'README.md': 'new\n' }));
      expect(r.status, r.out).toBe(0);
    });
  });
});
