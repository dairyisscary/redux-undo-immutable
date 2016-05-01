/* @flow */
import type { Action, JumpAction } from './reducer';

export const ActionTypes = {
  UNDO: '@@redux-undo-immutable/UNDO',
  REDO: '@@redux-undo-immutable/REDO',
  JUMP_TO_FUTURE: '@@redux-undo-immutable/JUMP_TO_FUTURE',
  JUMP_TO_PAST: '@@redux-undo-immutable/JUMP_TO_PAST',
  JUMP: '@@redux-undo-immutable/JUMP',
  CLEAR_HISTORY: '@@redux-undo-immutable/CLEAR_HISTORY',
};

export const ActionCreators = {
  undo(): Action {
    return { type: ActionTypes.UNDO };
  },
  redo(): Action {
    return { type: ActionTypes.REDO };
  },
  jumpToFuture(index: number): JumpAction {
    return { type: ActionTypes.JUMP_TO_FUTURE, index };
  },
  jumpToPast(index: number): JumpAction {
    return { type: ActionTypes.JUMP_TO_PAST, index };
  },
  jump(index: number): JumpAction {
    return { type: ActionTypes.JUMP, index };
  },
  clearHistory(): Action {
    return { type: ActionTypes.CLEAR_HISTORY };
  },
};
