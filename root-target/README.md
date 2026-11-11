# Targeting the machine root

[Open in StackBlitz](https://stackblitz.com/github/robertpenner/xstate-lifecycle-repros/tree/main/root-target?file=index.mjs&view=editor)

Run `npm ci` followed by `npm start`, or open the StackBlitz terminal.
The project starts automatically.

A child of the machine root handles `GO` with:

```js
{
  target: "#root";
}
```

Both `xstate@5.33.4` and `xstate@6.0.0-beta.2` return:

```text
exit child -> entry root -> entry child
```

Root entry appears without root exit. Controls show:

- Adding `reenter: true` also produces `exit root`.
- Targeting an ordinary enclosing compound state produces both ancestor exit
  and ancestor entry without requesting reentry.

This is a behavior/semantics question, not a v6-only regression. SCXML's
[document wrapper](https://www.w3.org/TR/2015/REC-scxml-20150901/#scxml)
is not an ordinary targetable state, so this XState root extension has no
direct standard counterpart. SCXML's general
[entry-set rule](https://www.w3.org/TR/2015/REC-scxml-20150901/#SelectingTransitions)
does not reenter an already-active state that was not exited.

The script uses public pure transition APIs and inspects returned
actions/effects. It does not execute effect bodies. Initialization effects are
excluded. Assertions characterize the current output; a passing run reproduces
the behavior under discussion.
