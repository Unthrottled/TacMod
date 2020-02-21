import {
  CACHED_OBJECTIVE,
  COMPLETED_OBJECTIVE,
  CREATED_OBJECTIVE,
  DELETED_OBJECTIVE,
  FOUND_OBJECTIVES,
  SYNCED_OBJECTIVES,
  UPDATED_OBJECTIVE,
} from '../events/StrategyEvents';
import {objectToArray, objectToKeyValueArray} from '../miscellanous/Tools';
import {CachedObjective, KeyResult, Objective} from '../types/StrategyTypes';
import {HasId, StringDictionary} from '../types/BaseTypes';
import {LOGGED_OFF} from '../events/SecurityEvents';

export interface StrategyState {
  objectives: StringDictionary<Objective>;
  keyResults: StringDictionary<KeyResult>;
  cache: StringDictionary<CachedObjective[]>;
}

const INITIAL_STRATEGY_STATE: StrategyState = {
  objectives: {},
  keyResults: {},
  cache: {},
};

export const dictionaryReducer = <T extends HasId>(
  accum: StringDictionary<T>,
  toIndex: T,
) => {
  accum[toIndex.id] = toIndex;
  return accum;
};

const updateStateWithObjectives = (
  newObjectives: Objective[],
  newKeyResults: KeyResult[],
  state: StrategyState,
): StrategyState => {
  const objectives = [
    ...objectToArray(state.objectives),
    ...newObjectives,
  ].reduce(dictionaryReducer, {});
  const keyResults = [
    ...objectToArray(state.keyResults),
    ...newKeyResults,
  ].reduce(dictionaryReducer, {});
  return {
    ...state,
    objectives,
    keyResults,
  };
};

const StrategyReducer = (
  state: StrategyState = INITIAL_STRATEGY_STATE,
  action: any,
) => {
  switch (action.type) {
    case LOGGED_OFF:
      return {
        ...INITIAL_STRATEGY_STATE,
        cache: state.cache,
      };

    case CREATED_OBJECTIVE:
    case UPDATED_OBJECTIVE:
      const newObjective = [action.payload];
      const keyResult = action.payload.keyResults;
      return updateStateWithObjectives(newObjective, keyResult, state);
    case DELETED_OBJECTIVE:
    case COMPLETED_OBJECTIVE:
      const {payload} = action;
      const deletedObjective: Objective = payload;
      const newObjectives = objectToArray(state.objectives).filter(
        suspiciousObjective => suspiciousObjective.id !== deletedObjective.id,
      );
      const newKeyResults = objectToArray(state.keyResults).filter(
        possibleRemovableKeyResult =>
          deletedObjective.keyResults.filter(
            keyResultToRemove =>
              keyResultToRemove.id === possibleRemovableKeyResult.id,
          ).length === 0,
      );
      return {
        ...state,
        objectives: newObjectives.reduce(dictionaryReducer, {}),
        keyResults: newKeyResults.reduce(dictionaryReducer, {}),
      };
    case FOUND_OBJECTIVES:
      const rememberedObjectives = action.payload.reduce(dictionaryReducer, {});
      const rememberedKeyResults = action.payload
        .flatMap((foundObjective: Objective) => foundObjective.keyResults)
        .reduce(dictionaryReducer, {});
      return {
        ...state,
        objectives: rememberedObjectives,
        keyResults: rememberedKeyResults,
      };
    case CACHED_OBJECTIVE: {
      const {userGUID, objective} = action.payload;
      if (state.cache[userGUID]) {
        state.cache[userGUID].push(objective);
      } else {
        state.cache[userGUID] = [objective];
      }
      return {
        ...state,
        cache: {
          ...state.cache,
        },
      };
    }
    case SYNCED_OBJECTIVES: {
      return {
        ...state,
        cache: {
          ...objectToKeyValueArray(state.cache)
            .filter(keyValues => keyValues.key !== action.payload)
            .reduce((accum: StringDictionary<CachedObjective[]>, keyValue) => {
              accum[keyValue.key] = keyValue.value;
              return accum;
            }, {}),
        },
      };
    }
    default:
      return state;
  }
};

export default StrategyReducer;
