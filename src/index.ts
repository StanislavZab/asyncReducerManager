export { DynamicModuleLoader } from './DynamicModuleLoader';
import { CombinedState } from 'redux';
import { useStore } from 'react-redux';
import {
    Action,
    AnyAction,
    combineReducers,
    createSlice,
    EmptyObject,
    MiddlewareArray,
    Reducer,
    ReducersMapObject,
    ThunkMiddleware,
} from '@reduxjs/toolkit';
import { ToolkitStore } from '@reduxjs/toolkit/dist/configureStore';

export interface ReducerManager<T> {
    getReducerMap: () => ReducersMapObject<T, Action<any>>;
    reduce: (state: T | undefined, action: AnyAction) => CombinedState<T>;
    add: (key: keyof T, reducer: Reducer) => void;
    remove: (key: keyof T) => void;
}

export interface ReduxStoreWithManager<T> extends ToolkitStore<
    EmptyObject & T,
    AnyAction,
    MiddlewareArray<[ThunkMiddleware<CombinedState<T>, AnyAction, undefined>]>> {
    reducerManager: ReducerManager<T>;
}

export const useReducerManager = <T>() => {
    const store = useStore() as ReduxStoreWithManager<T>;
    return store.reducerManager;
};

export function createReducerManager<T>(initialReducers: ReducersMapObject<T>): ReducerManager<T> {
    type ManagerStateSchema = T | { default: null }

    const defaultReducer = {
        default: createSlice({
            name: 'default',
            reducers: {},
            initialState: {},
        }).reducer,
    } as ReducersMapObject<ManagerStateSchema>;

    const reducers = !Object.keys(initialReducers).length ? { ...defaultReducer } : { ...initialReducers };

    let combinedReducer = combineReducers(reducers as ReducersMapObject<T>);

    let keysToRemove: Array<keyof T> = [];

    return {
        getReducerMap: () => reducers as ReducersMapObject<T, Action<any>>,

        reduce: (state: T | undefined, action: AnyAction) => {
            if (keysToRemove.length > 0) {
                state = { ...state } as T;
                keysToRemove.forEach((key) => {
                    if (state && !!state[key]) {
                        delete state[key];
                    }
                });
                keysToRemove = [];
            }

            return combinedReducer(state ?? undefined, action);
        },

        add: (key: keyof T, reducer: Reducer) => {
            if (!key) return;
            if (reducers[key as keyof ManagerStateSchema]) return;

            reducers[key as keyof ManagerStateSchema] = reducer;

            if (reducers['default' as keyof ManagerStateSchema]) {
                delete reducers['default' as keyof ManagerStateSchema];
            }

            combinedReducer = combineReducers(reducers as ReducersMapObject<T>);

            keysToRemove.push('default' as keyof T);
        },
        remove: (key: keyof T) => {
            if (!key || !reducers[key as keyof ManagerStateSchema]) return;

            delete reducers[key as keyof ManagerStateSchema];

            keysToRemove.push(key);

            if (!Object.keys(reducers).length) {
                combinedReducer = combineReducers(defaultReducer as ReducersMapObject<T>);
            } else {
                combinedReducer = combineReducers(reducers as ReducersMapObject<T>);
            }
        },
    };
}
