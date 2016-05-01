# Redux Undo Immutable
_A higher order reducer to add undo/redo to redux state containers using immutable js!_

## About
This small project enables you to have undo/redo functionality on your redux reducers as easy as pie. It is _almost_ identical [redx-undo](https://github.com/omnidan/redux-undo/) in both API and conceptually, except that it uses [immutable js](https://facebook.github.io/immutable-js/) for the state data structure, for those of us who prefer it to be turtles all the way down.

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
The result of the above is another reducer that will update state as a historical log.

**Note:** If you were accessing `state.counter` before, you have to access
`state.counter.present` after wrapping your reducer with `undoable`.

## License
MIT, see `LICENSE.md` for more information.
