/* @flow */
import type { List } from 'immutable';

import { ActionTypes } from './actions';
import type { Action } from './reducer';

export type Configuration<S> = {
  undoType: string,
  redoType: string,
  jumpToPastType: string,
  jumpToFutureType: string,
  jumpType: string,
  clearHistoryType: string,
  actionFilter: (a: Action, pres: S, past: List) => boolean,
  historyFilter: (a: Action, pres: S) => boolean,
};

export function make<S>(rawConfig?: Object): Configuration<S> {
  rawConfig = rawConfig || {};
  return {
    undoType: rawConfig.undoType || ActionTypes.UNDO,
    redoType: rawConfig.redoType || ActionTypes.REDO,
    jumpToPastType: rawConfig.jumpToPastType || ActionTypes.JUMP_TO_PAST,
    jumpToFutureType: rawConfig.jumpToFutureType || ActionTypes.JUMP_TO_FUTURE,
    jumpType: rawConfig.jumpType || ActionTypes.JUMP,
    clearHistoryType: rawConfig.clearHistoryType || ActionTypes.CLEAR_HISTORY,
    actionFilter: rawConfig.actionFilter || (() => true),
    historyFilter: rawConfig.historyFilter || (() => true),
  };
}
