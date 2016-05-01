/* eslint-env mocha */
import { List } from 'immutable';
import expect from 'unexpected';

import { ActionCreators } from '../actions';
import undoable, { StateHistory } from '../reducer';

describe('Undoable Higher Order Reducer', () => {

  const lowerReducer = (state = 0, action) => {
    switch (action.type) {
    case 'INC':
      return state + 1;
    case 'DEC':
      return state - 1;
    case 'DOUBLE':
      return state * 2;
    default:
      return state;
    }
  };

  describe('Reducer', () => {

    it('should keep track of past states and undo them.', () => {
      const reduce = undoable(lowerReducer);
      const res = reduce(undefined, {}); // init
      expect(res.toJS(), 'to satisfy', {
        past: [],
        present: 0,
        future: [],
      });

      const res2 = reduce(res, { type: 'INC' });
      expect(res2.toJS(), 'to satisfy', {
        past: [0],
        present: 1,
        future: [],
      });
    });

    it('should handle no ops.', () => {
      const reduce = undoable(lowerReducer);
      const init = reduce(undefined, {});
      const res = reduce(init, {});
      const res2 = reduce(res, {});
      expect(res, 'to be', res2);
    });

    it('should only keep track of past states that are not filtered.', () => {
      const reduce = undoable(lowerReducer, {
        historyFilter: action => action.type !== 'DOUBLE',
        actionFilter: action => ['DOUBLE', 'DEC'].indexOf(action.type) === -1,
      });
      const init = reduce(undefined, {});
      const res = reduce(init, { type: 'INC' });
      expect(res.toJS(), 'to satisfy', {
        past: [0],
        present: 1,
        future: [],
      });

      const res2 = reduce(res, { type: 'DOUBLE' });
      expect(res2.toJS(), 'to satisfy', {
        past: [0],
        present: 2,
        future: [],
      });

      const res3 = reduce(res2, { type: 'DOUBLE' });
      expect(res3.toJS(), 'to satisfy', {
        past: [0],
        present: 4,
        future: [],
      });

      const res4 = reduce(res3, { type: 'INC' });
      expect(res4.toJS(), 'to satisfy', {
        past: [0, 1],
        present: 5,
        future: [],
      });

      const res5 = reduce(res4, { type: 'DEC' });
      expect(res5.toJS(), 'to satisfy', {
        past: [0, 1],
        present: 4,
        future: [],
      });

      const res6 = reduce(res5, { type: 'INC' });
      expect(res6.toJS(), 'to satisfy', {
        past: [0, 1, 4],
        present: 5,
        future: [],
      });
    });

    it('should not add history filtered to the past.', () => {
      const reduce = undoable(lowerReducer, {
        historyFilter: action => action.type !== 'INC',
      });
      const init = reduce(undefined, {});
      const res = reduce(init, { type: 'INC' });
      expect(res.toJS(), 'to satisfy', {
        past: [0],
        present: 1,
        future: [],
      });

      const res2 = reduce(res, { type: 'INC' });
      expect(res2.toJS(), 'to satisfy', {
        past: [0],
        present: 2,
        future: [],
      });

      const res3 = reduce(res2, { type: 'DEC' });
      expect(res3.toJS(), 'to satisfy', {
        past: [0],
        present: 1,
        future: [],
      });
    });

  }); // end Reducer describe

  describe('ClearHistory', () => {

    it('should clear the history.', () => {
      const reduce = undoable(lowerReducer);
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });
      const res = reduce(init, ActionCreators.clearHistory());
      expect(res.toJS(), 'to equal', {
        past: [],
        present: 10,
        future: [],
      });
    });

    it('should work with configured type.', () => {
      const reduce = undoable(lowerReducer, { clearHistoryType: 'clearhist' });
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });
      const res = reduce(init, { type: 'clearhist' });
      expect(res.toJS(), 'to equal', {
        past: [],
        present: 10,
        future: [],
      });
    });

  }); // end ClearHistory describe

  describe('Undo', () => {

    it('should undo.', () => {
      const reduce = undoable(lowerReducer);
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });
      const res = reduce(init, ActionCreators.undo());
      expect(res.toJS(), 'to equal', {
        past: [1, 2],
        present: 3,
        future: [10, 11, 12],
      });

      const res2 = reduce(res, ActionCreators.undo());
      expect(res2.toJS(), 'to equal', {
        past: [1],
        present: 2,
        future: [3, 10, 11, 12],
      });
    });

    it('should work when user incorrectly dispatches this action.', () => {
      const reduce = undoable(lowerReducer);
      const init = StateHistory({
        past: List(),
        present: 10,
        future: List([11, 12]),
      });
      const res = reduce(init, ActionCreators.undo());
      expect(res.toJS(), 'to equal', {
        past: [],
        present: 10,
        future: [11, 12],
      });
    });

    it('should work with configured type.', () => {
      const reduce = undoable(lowerReducer, { undoType: 'undo' });
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });
      const res = reduce(init, { type: 'undo' });
      expect(res.toJS(), 'to equal', {
        past: [1, 2],
        present: 3,
        future: [10, 11, 12],
      });
    });

  }); // end Undo describe

  describe('Redo', () => {

    it('should redo.', () => {
      const reduce = undoable(lowerReducer);
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });
      const res = reduce(init, ActionCreators.redo());
      expect(res.toJS(), 'to equal', {
        past: [1, 2, 3, 10],
        present: 11,
        future: [12],
      });

      const res2 = reduce(res, ActionCreators.redo());
      expect(res2.toJS(), 'to equal', {
        past: [1, 2, 3, 10, 11],
        present: 12,
        future: [],
      });
    });

    it('should work when user incorrectly dispatches this action.', () => {
      const reduce = undoable(lowerReducer);
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List(),
      });
      const res = reduce(init, ActionCreators.redo());
      expect(res.toJS(), 'to equal', {
        past: [1, 2, 3],
        present: 10,
        future: [],
      });
    });

    it('should work with configured type.', () => {
      const reduce = undoable(lowerReducer, { redoType: 'redo' });
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });
      const res = reduce(init, { type: 'redo' });
      expect(res.toJS(), 'to equal', {
        past: [1, 2, 3, 10],
        present: 11,
        future: [12],
      });
    });

  }); // end Redo describe

  describe('Jumping', () => {

    it('should noop on zero jump.', () => {
      const reduce = undoable(lowerReducer);
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });
      expect(reduce(init, ActionCreators.jump(0)), 'to be', init);
    });

    it('should respect bounds.', () => {
      const reduce = undoable(lowerReducer);
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });

      const res = reduce(init, ActionCreators.jumpToPast(4));
      expect(res.toJS(), 'to satisfy', {
        past: [1, 2, 3],
        present: 10,
        future: [11, 12],
      });

      const res2 = reduce(init, ActionCreators.jumpToFuture(3));
      expect(res2.toJS(), 'to satisfy', {
        past: [1, 2, 3],
        present: 10,
        future: [11, 12],
      });
    });

    it('should jump to the past.', () => {
      const reduce = undoable(lowerReducer);
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });

      const res = reduce(init, ActionCreators.jump(-2));
      expect(res.toJS(), 'to satisfy', {
        past: [1],
        present: 2,
        future: [3, 10, 11, 12],
      });

      const res2 = reduce(res, { type: 'INC' });
      expect(res2.toJS(), 'to satisfy', {
        past: [1, 2],
        present: 3,
        future: [],
      });

      const res3 = reduce(res2, ActionCreators.jump(-1));
      expect(res3.toJS(), 'to satisfy', {
        past: [1],
        present: 2,
        future: [3],
      });
    });

    it('should jump to the future.', () => {
      const reduce = undoable(lowerReducer);
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });

      const res = reduce(init, ActionCreators.jump(2));
      expect(res.toJS(), 'to satisfy', {
        past: [1, 2, 3, 10, 11],
        present: 12,
        future: [],
      });

      const res2 = reduce(res, { type: 'INC' });
      expect(res2.toJS(), 'to satisfy', {
        past: [1, 2, 3, 10, 11, 12],
        present: 13,
        future: [],
      });
    });

    it('should work with configured type for jump.', () => {
      const reduce = undoable(lowerReducer, { jumpType: 'jumper' });
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });
      const res = reduce(init, { type: 'jumper', index: 1 });
      expect(res.toJS(), 'to equal', {
        past: [1, 2, 3, 10],
        present: 11,
        future: [12],
      });
    });

    it('should work with configured type for jumpToPast.', () => {
      const reduce = undoable(lowerReducer, { jumpToPastType: 'jumppast' });
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });
      const res = reduce(init, { type: 'jumppast', index: 2 });
      expect(res.toJS(), 'to equal', {
        past: [1, 2],
        present: 3,
        future: [10, 11, 12],
      });
    });

    it('should work with configured type for jumpToFuture.', () => {
      const reduce = undoable(lowerReducer, { jumpToFutureType: 'jumpfuture' });
      const init = StateHistory({
        past: List([1, 2, 3]),
        present: 10,
        future: List([11, 12]),
      });
      const res = reduce(init, { type: 'jumpfuture', index: 0 });
      expect(res.toJS(), 'to equal', {
        past: [1, 2, 3, 10],
        present: 11,
        future: [12],
      });
    });

  }); // end Jump describe

});
