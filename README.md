# Redux Undo Immutable
_A higher order reducer to add undo/redo to redux state containers using immutable js!_

## About
This small project enables you to have undo/redo functionality on your redux reducers as easy as pie. It is conceptually identical to [redx-undo](https://github.com/omnidan/redux-undo/) and shares _almost_ the same API. The primary distinction is that it uses [immutable js](https://facebook.github.io/immutable-js/) for the state data structure (for those of us who prefer it to be turtles all the way down).

## Installation
This project marks immutable js as an external dependency so make sure you also have that installed.
```
npm install --save redux-undo-immutable
```

## API
```js
import undoable from 'redux-undo-immutable';
undoable(reducer)
undoable(reducer, config)
```
The result of the above is another reducer that will update state as a historical log:
```js
{
  past: List([0, 1, 2])
  present: 3,
  future: List([4, 5, 6])
}
```

**Note:** If you were accessing `state.counter` before, you have to access
`state.counter.present` after wrapping your reducer with `undoable`.

### Configuration
```js
import { ActionTypes } from 'redux-undo-immutable';

undoable(reducer, {
  limit: 0, // set to a number to turn on a limit for the history (0 means infinite)

  // TODO, explain these better:
  // filter for actions that are not allowed to become part of history
  actionFilter: () => true,
  // filter for states that are not allowed to become part of history
  historyFilter: () => true,

  undoType: ActionTypes.UNDO, // define a custom action type for this undo action
  redoType: ActionTypes.REDO, // define a custom action type for this redo action
  jumpType: ActionTypes.JUMP, // define custom action type for this jump action
  jumpToPastType: ActionTypes.JUMP_TO_PAST, // define custom action type for this jumpToPast action
  jumpToFutureType: ActionTypes.JUMP_TO_FUTURE, // define custom action type for this jumpToFuture action
  clearHistoryType: ActionTypes.CLEAR_HISTORY, // define custom action type for this clearHistory action
})
```

### Actions
There are some built in action creators for convenience (if you choose not to customize the Action types):
```js
import { ActionCreators } from 'redux-undo-immutable';

store.dispatch(ActionCreators.undo()) // undo the last action
store.dispatch(ActionCreators.redo()) // redo the last action

store.dispatch(ActionCreators.jump(-2)) // undo 2 steps
store.dispatch(ActionCreators.jump(5)) // redo 5 steps

store.dispatch(ActionCreators.jumpToPast(index)) // jump to requested index in the past List
store.dispatch(ActionCreators.jumpToFuture(index)) // jump to requested index in the future List

store.dispatch(ActionCreators.clearHistory()) // Remove all items from past and future Lists
```

## License
MIT, see `LICENSE.md` for more information.
