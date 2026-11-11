# XState lifecycle reproductions

Two standalone Node.js projects comparing published `xstate@5.33.4` and
`xstate@6.0.0-beta.2`. No fork build or formalization tooling is required.

| Case                       | Open runnable project                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Targetless reentry         | [Open in StackBlitz](https://stackblitz.com/github/robertpenner/xstate-lifecycle-repros/tree/main/targetless-reentry?file=index.mjs&view=editor) |
| Targeting the machine root | [Open in StackBlitz](https://stackblitz.com/github/robertpenner/xstate-lifecycle-repros/tree/main/root-target?file=index.mjs&view=editor)        |

Each project starts automatically and prints lifecycle traces in its terminal.
If StackBlitz asks for permission to start its environment, choose **Run this
project**. To rerun, use `npm start` in the project terminal.

The examples use the public pure transition APIs. They print the actions/effects
returned for one `GO` event; initialization effects are excluded. The effect
bodies are not executed. Assertions preserve the currently observed behavior,
including the suspected defects, so a passing run means the observation was
reproduced.

## Results

- **Targetless reentry:** v5 returns no lifecycle actions; v6 returns child entry
  without child exit. Ordinary targetless and explicit self-reentry controls
  are included.
- **Machine-root target without reentry:** both versions return child exit,
  root entry, child entry, without root exit. Explicit root reentry and an
  ordinary compound-ancestor target are included as controls.

SCXML specifies empty entry and exit sets for targetless transitions.
XState's targetable machine root is an extension with no direct SCXML equivalent.
The second case therefore asks which root behavior XState intends.
See [SCXML section 3.13](https://www.w3.org/TR/2015/REC-scxml-20150901/#SelectingTransitions)
and [the SCXML document wrapper](https://www.w3.org/TR/2015/REC-scxml-20150901/#scxml).

## Run locally

```sh
cd targetless-reentry # or root-target
npm ci
npm test
```

These are external-consumer reproductions using npm-compatible lockfiles for
StackBlitz. Each folder is independent.
