import { readFile } from 'node:fs/promises';

const payload = JSON.parse(await readFile(new URL('../combos.json', import.meta.url), 'utf8'));
const keys = ['C+L+M', 'C+L+P', 'C+L+R'];
const types = ['ISTJ', 'INFJ'];
for (const key of keys) {
  const record = payload.combos[key];
  if (!record) throw new Error(`missing combo ${key}`);
  for (const type of types) {
    const job = record.types?.[type]?.job;
    if (!job) throw new Error(`missing job for ${key}/${type}`);
    console.log(`${key}/${type}: ${job}`);
  }
}
const allJobs = keys.flatMap(k => Object.values(payload.combos[k].types).flatMap(v => String(v.job).split(',').map(s => s.trim())));
if (!allJobs.some(j => j.includes('응급구조사'))) throw new Error('응급구조사 not present in sampled combos');
console.log('PASS: 3 combos × 2 types; 응급구조사 observed');

