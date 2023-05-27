The library is designed to help you create asynchronous reduxers for the Redux store.<br>
The library also contains a React component for easy addition and removal of editors.
***
***

###Example:

```ts
import { CombinedState, configureStore, Reducer, ReducersMapObject } from '@reduxjs/toolkit';
import { createReducerManager, ReduxStoreWithManager } from 'async-reducer-manager';

export function createReduxStore<StateSchema>(rootReducers: ReducersMapObject<StateSchema>) {
    const reducerManager = createReducerManager<StateSchema>(rootReducers);

    const store = configureStore({
        reducer: reducerManager.reduce as Reducer<CombinedState<StateSchema>>,
        devTools: __IS_DEV__,
    }) as ReduxStoreWithManager<StateSchema>;

    store.reducerManager = reducerManager;

    return store;
}

```

```ts
import { DynamicModuleLoader } from 'async-reducer-manager';
interface IProps {
    Your propses...
}

const initialReducers: ReducersList<StateSchema> = {
    Your reducer...
};

export const ComponentName = (props: IProps) => {
    Component logic...

    return (
        <DynamicModuleLoader reducers={initialReducers} removeAfterUnmount>
            Your components
        </DynamicModuleLoader>
    );
}
```

`DynamicModuleLoader` accepts two parameters as passes:<br>
* ___redusers___