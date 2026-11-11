import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as v5 from 'xstate-v5';
import * as v6 from 'xstate-v6';

const require = createRequire(import.meta.url);
const versions = [
  { api: v5, name: 'v5', version: require('xstate-v5/package.json').version },
  { api: v6, name: 'v6', version: require('xstate-v6/package.json').version },
];
assert.equal(versions[0].version, '5.33.4');
assert.equal(versions[1].version, '6.0.0-beta.2');

const cases = [
  {
    name: 'CONTROL: targetless, no reentry',
    transition: {},
    expected: { v5: [], v6: [] },
  },
  {
    name: 'REPRO: targetless with reenter: true',
    transition: { reenter: true },
    expected: { v5: [], v6: ['entry a'] },
  },
  {
    name: 'CONTROL: explicit self-target with reenter: true',
    transition: { target: 'a', reenter: true },
    expected: { v5: ['exit a', 'entry a'], v6: ['exit a', 'entry a'] },
  },
];

console.log('Targetless reentry: v5 versus v6');
console.log(
  'Only effects returned for GO are shown. Initialization is excluded.',
);
console.log('SCXML targetless transitions have empty entry and exit sets.\n');

for (const testCase of cases) {
  console.log(testCase.name);
  for (const { api, name, version } of versions) {
    const record = () => {};
    const lifecycle =
      name === 'v6'
        ? {
            entry: (_, enq) => enq(record, 'entry a'),
            exit: (_, enq) => enq(record, 'exit a'),
          }
        : { entry: 'entry a', exit: 'exit a' };
    const config = {
      initial: 'a',
      states: {
        a: { ...lifecycle, on: { GO: testCase.transition } },
      },
    };
    const machine =
      name === 'v6'
        ? api.createMachine(config)
        : api.createMachine(config, {
            actions: { 'entry a': record, 'exit a': record },
          });
    const [initial] = api.initialTransition(machine);
    const [next, effects] = api.transition(machine, initial, { type: 'GO' });
    const trace = effects.map(effect =>
      name === 'v6' ? effect.args[0] : effect.type,
    );
    console.log(
      `  ${version}: ${trace.length ? trace.join(' -> ') : '(none)'}`,
    );
    assert.equal(next.value, 'a');
    assert.deepEqual(trace, testCase.expected[name]);
  }
  console.log('');
}

console.log('REPRODUCED: only v6 emits entry for targetless reentry.');
console.log('All 6 lifecycle characterizations passed.');
