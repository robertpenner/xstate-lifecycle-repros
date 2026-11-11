# Targetless reentry

[Open in StackBlitz](https://stackblitz.com/github/robertpenner/xstate-lifecycle-repros/tree/main/targetless-reentry?file=index.mjs&view=editor)

Run `npm ci` followed by `npm start`, or open the StackBlitz terminal.
The project starts automatically.

The transition under examination is:

```js
on: {
  GO: {
    reenter: true;
  }
}
```

There is no target. Both versions keep the state value at `a`, but:

| Version      | Lifecycle actions/effects returned for GO |
| ------------ | ----------------------------------------- |
| 5.33.4       | None                                      |
| 6.0.0-beta.2 | `entry a`                                 |

SCXML's [normative section 3.13](https://www.w3.org/TR/2015/REC-scxml-20150901/#SelectingTransitions)
gives targetless transitions empty entry and exit sets. XState's `reenter`
option is its own API, but the observed v6 behavior differs from both that
rule and the tested v5 release.

The script includes ordinary targetless and explicit self-reentry controls.
It uses public pure transition APIs and inspects returned actions/effects.
It does not execute effect bodies. Initialization effects are excluded.
Assertions characterize the current output; a passing run reproduces the
suspected regression.
