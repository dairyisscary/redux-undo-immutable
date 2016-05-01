/* @flow */
import { Record, List } from 'immutable';

import { make } from './config';
import type { Configuration } from './config';

export type Action = { type: string };
export type JumpAction = { type: string, index: number };
type IStateHistory<S> = {
  _lastInterestingPresent?: S,
  past: List,
  present: S,
  future: List,
  merge: (o: any) => IStateHistory<S>,
};
type Reducer<S> = (s?: S, a: Action) => S;
type HistoricalReducer<S> =
  (his?: IStateHistory<S>, act: JumpAction) => IStateHistory<S>;

export const StateHistory = Record({
  past: List(),
  present: undefined,
  _lastInterestingPresent: undefined,
  future: List(),
});

function lastInterestingPresent<S>(config: Configuration<S>,
                                   action: Action,
                                   newPresent: S,
                                   previousInteresing?: S):? S {
  return config.historyFilter(action, newPresent) ?
    newPresent :
    previousInteresing;
}

function undo<S>(history: IStateHistory<S>): IStateHistory<S> {
  const { past, present, future } = history;
  return past.size ?
    StateHistory({
      past: past.slice(0, past.size - 1),
      present: past.last(),
      future: future.unshift(present),
    }) :
    history;
}

function redo<S>(history: IStateHistory<S>): IStateHistory<S> {
  const { past, present, future } = history;
  return future.size ?
    StateHistory({
      past: past.push(present),
      present: future.first(),
      future: future.slice(1),
    }) :
    history;
}

function clearHistory<S>(history: IStateHistory<S>): IStateHistory<S> {
  return StateHistory({ present: history.present });
}

function jumpToFuture<S>(history: IStateHistory<S>, i: number): IStateHistory<S> {
  const { past, present, future } = history;
  if (i === 0) { return redo(history); }
  if (i < 0 || i >= future.size) { return history; }
  return StateHistory({
    past: past.withMutations(pastMut => {
      pastMut.concat([present]).concat(future.slice(0, i));
    }),
    present: future.get(i),
    future: future.slice(i + 1),
  });
}

function jumpToPast<S>(history: IStateHistory<S>, i: number): IStateHistory<S> {
  const { past, present, future } = history;
  if (i === past.size - 1) { return undo(history); }
  if (i < 0 || i >= past.size) { return history; }
  return StateHistory({
    past: past.slice(0, i),
    present: past.get(i),
    future: past.withMutations(pastMut => {
      pastMut.slice(i + 1).concat([present]).concat(future);
    }),
  });
}

function jump<S>(history: IStateHistory<S>, n: number): IStateHistory<S> {
  if (n > 0) { return jumpToFuture(history, n - 1); }
  if (n < 0) { return jumpToPast(history, history.past.size + n); }
  return history;
}

function undoable<S>(reducer: Reducer<S>,
                     rawConfig: Configuration<S>): HistoricalReducer<S> {
  const config = make(rawConfig);

  return (history = undefined, action) => {

    if (history === undefined) {
      const present: S = reducer(undefined, action);
      const _lastInterestingPresent = lastInterestingPresent(
        config, action, present);
      return StateHistory({ present, _lastInterestingPresent });
    }

    switch (action.type) {

    case config.undoType:
      return undo(history);

    case config.redoType:
      return redo(history);

    case config.jumpToPastType:
      return jumpToPast(history, action.index);

    case config.jumpToFutureType:
      return jumpToFuture(history, action.index);

    case config.jumpType:
      return jump(history, action.index);

    case config.clearHistoryType:
      return clearHistory(history);

    default:
      const { _lastInterestingPresent, past, present } = history;
      const newPresent: S = reducer(present, action);
      const newLastInterestingPresent = lastInterestingPresent(
        config, action, newPresent, _lastInterestingPresent);
      if (present === newPresent) {
        return history;
      } else if (!config.actionFilter(action, present, past)) {
        return history.merge({
          present: newPresent,
          _lastInterestingPresent: newLastInterestingPresent,
        });
      }
      return StateHistory({
        past: _lastInterestingPresent === undefined ?
          past :
          past.push(_lastInterestingPresent),
        present: newPresent,
        future: List(),
        _lastInterestingPresent: newLastInterestingPresent,
      });

    }
  };
}

export default undoable;
