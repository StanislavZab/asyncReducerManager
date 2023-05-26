import { Reducer } from '@reduxjs/toolkit';
import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useReducerManager } from '../hooks/useReducerManager';

export type ReducersList<T> = {
    [name in keyof T]?: Reducer;
}

interface IProps<T> {
    children: JSX.Element;
    reducers: ReducersList<T>;
    removeAfterUnmount?: boolean;
}

/**
 * Обертка которая добавляет редьюсеры
 * Принимает пропсы:
 * @children - чилдрен компонент
 * @reducers - редьюсеры, предаются обьектом
 * Не обязательный:
 * @removeAfterUnmount - булево значение, если true, то удалит элемент после отрисовки
 */
export const DynamicModuleLoader = <T, >(props: IProps<T>): JSX.Element => {
    const {
        children,
        reducers,
        removeAfterUnmount,
    } = props;
    // const store = useStore() as ReduxStoreWithManager<StateSchema>;
    const manager = useReducerManager<T>();
    const dispatch = useDispatch();

    useEffect(() => {
        const mountedReducers = manager.getReducerMap();

        Object.entries(reducers).forEach(([name, reducer]) => {
            if (mountedReducers[name as keyof T] === undefined) {
                manager.add(name as keyof T, reducer as Reducer);
                dispatch({ type: `@INIT ${name} reducer` });
            }
        });

        return () => {
            if (removeAfterUnmount) {
                Object.entries(reducers).forEach(([name]) => {
                    manager.remove(name as keyof T);
                    dispatch({ type: `@DESTROY ${name} reducer` });
                });
            }
        };
        // eslint-disable-next-line
    }, []);

    return children;
};
