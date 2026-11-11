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
    name: 'REPRO: child targets machine root, without reentry',
    ancestor: 'root',
    transition: { target: '#root' },
    expected: ['exit child', 'entry root', 'entry child'],
  },
  {
    name: 'CONTROL: child targets machine root, with reentry',
    ancestor: 'root',
    transition: { target: '#root', reenter: true },
    expected: ['exit child', 'exit root', 'entry root', 'entry child'],
  },
  {
    name: 'CONTROL: child targets ordinary compound ancestor',
    ancestor: 'ancestor',
    transition: { target: '#ancestor' },
    expected: ['exit child', 'exit ancestor', 'entry ancestor', 'entry child'],
  },
];

console.log('Targeting the machine root: v5 versus v6');
console.log(
  'Only effects returned for GO are shown. Initialization is excluded.',
);
console.log(
  'The machine root is an XState extension; its intended semantics need clarification.\n',
);

for (const testCase of cases) {
  console.log(testCase.name);
  for (const { api, name, version } of versions) {
    const record = () => {};
    const lifecycle = state =>
      name === 'v6'
        ? {
            entry: (_, enq) => enq(record, `entry ${state}`),
            exit: (_, enq) => enq(record, `exit ${state}`),
          }
        : { entry: `entry ${state}`, exit: `exit ${state}` };
    const parent = {
      id: testCase.ancestor,
      initial: 'child',
      ...lifecycle(testCase.ancestor),
      states: {
        child: { ...lifecycle('child'), on: { GO: testCase.transition } },
      },
    };
    const config =
      testCase.ancestor === 'root'
        ? parent
        : { initial: 'ancestor', states: { ancestor: parent } };
    const machine =
      name === 'v6'
        ? api.createMachine(config)
        : api.createMachine(config, {
            actions: Object.fromEntries(
              ['root', 'ancestor', 'child'].flatMap(state => [
                [`entry ${state}`, record],
                [`exit ${state}`, record],
              ]),
            ),
          });
    const [initial] = api.initialTransition(machine);
    const [next, effects] = api.transition(machine, initial, { type: 'GO' });
    const trace = effects.map(effect =>
      name === 'v6' ? effect.args[0] : effect.type,
    );
    console.log(`  ${version}: ${trace.join(' -> ')}`);
    assert.deepEqual(
      next.value,
      testCase.ancestor === 'root' ? 'child' : { ancestor: 'child' },
    );
    assert.deepEqual(trace, testCase.expected);
  }
  console.log('');
}

console.log(
  'REPRODUCED: both versions enter the preserved root without exiting it.',
);
console.log('All 6 lifecycle characterizations passed.');
