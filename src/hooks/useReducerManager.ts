import { useStore } from 'react-redux';
import { ReduxStoreWithManager } from '../reducerManager/reducerManager';

/**
 * Этот хук используется для получения manager
 * который позволяет динамически добавлять, удалять и заменять редьюсеры
 */
export const useReducerManager = <T>() => {
    const store = useStore() as ReduxStoreWithManager<T>;
    return store.reducerManager;
};