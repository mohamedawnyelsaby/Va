import { useState, useCallback, useTransition } from 'react';

interface UseOptimisticUpdateOptions<T> {
  onUpdate?: (data: T) => Promise<T>;
  onError?: (error: Error) => void;
  rollbackDelay?: number;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  options: UseOptimisticUpdateOptions<T> = {}
) {
  const {
    onUpdate,
    onError,
    rollbackDelay = 0,
  } = options;

  const [data, setData] = useState<T>(initialData);
  const [isPending, startTransition] = useTransition();
  const [isError, setIsError] = useState(false);

  const update = useCallback(
    async (newData: T | ((prev: T) => T)) => {
      const previousData = data;

      startTransition(() => {
        setData(
          typeof newData === 'function'
            ? (newData as (prev: T) => T)(data)
            : newData
        );
      });

      if (!onUpdate) return;

      try {
        const updatedData = await onUpdate(
          typeof newData === 'function'
            ? (newData as (prev: T) => T)(data)
            : newData
        );

        setData(updatedData);
        setIsError(false);
      } catch (error) {
        console.error('Optimistic update failed:', error);
        
        setTimeout(() => {
          setData(previousData);
          setIsError(true);
          
          if (onError) {
            onError(error as Error);
          }
        }, rollbackDelay);
      }
    },
    [data, onUpdate, onError, rollbackDelay]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setIsError(false);
  }, [initialData]);

  return {
    data,
    update,
    isPending,
    isError,
    reset,
  };
}

export function useOptimisticList<T extends { id: string }>(
  initialData: T[],
  options: {
    onAdd?: (item: T) => Promise<T>;
    onUpdate?: (item: T) => Promise<T>;
    onDelete?: (id: string) => Promise<void>;
    onError?: (error: Error, operation: 'add' | 'update' | 'delete') => void;
  } = {}
) {
  const [data, setData] = useState<T[]>(initialData);
  const [isPending, startTransition] = useTransition();
  const [isError, setIsError] = useState(false);

  const add = useCallback(
    async (item: T) => {
      const previousData = data;

      startTransition(() => {
        setData((prev) => [...prev, item]);
      });

      if (!options.onAdd) return;

      try {
        const addedItem = await options.onAdd(item);
        
        setData((prev) =>
          prev.map((i) => (i.id === item.id ? addedItem : i))
        );
        setIsError(false);
      } catch (error) {
        console.error('Add failed:', error);
        setData(previousData);
        setIsError(true);
        
        if (options.onError) {
          options.onError(error as Error, 'add');
        }
      }
    },
    [data, options]
  );

  const update = useCallback(
    async (item: T) => {
      const previousData = data;

      startTransition(() => {
        setData((prev) =>
          prev.map((i) => (i.id === item.id ? item : i))
        );
      });

      if (!options.onUpdate) return;

      try {
        const updatedItem = await options.onUpdate(item);
        
        setData((prev) =>
          prev.map((i) => (i.id === item.id ? updatedItem : i))
        );
        setIsError(false);
      } catch (error) {
        console.error('Update failed:', error);
        setData(previousData);
        setIsError(true);
        
        if (options.onError) {
          options.onError(error as Error, 'update');
        }
      }
    },
    [data, options]
  );

  const remove = useCallback(
    async (id: string) => {
      const previousData = data;

      startTransition(() => {
        setData((prev) => prev.filter((i) => i.id !== id));
      });

      if (!options.onDelete) return;

      try {
        await options.onDelete(id);
        setIsError(false);
      } catch (error) {
        console.error('Delete failed:', error);
        setData(previousData);
        setIsError(true);
        
        if (options.onError) {
          options.onError(error as Error, 'delete');
        }
      }
    },
    [data, options]
  );

  const reset = useCallback(() => {
    setData(initialData);
    setIsError(false);
  }, [initialData]);

  return {
    data,
    add,
    update,
    remove,
    isPending,
    isError,
    reset,
  };
}

export function useOptimisticFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const toggle = useCallback(
    async (
      itemId: string,
      onToggle?: (itemId: string, isFavorite: boolean) => Promise<void>
    ) => {
      const wasFavorite = favorites.has(itemId);

      startTransition(() => {
        setFavorites((prev) => {
          const next = new Set(prev);
          if (wasFavorite) {
            next.delete(itemId);
          } else {
            next.add(itemId);
          }
          return next;
        });
      });

      if (!onToggle) return;

      try {
        await onToggle(itemId, !wasFavorite);
      } catch (error) {
        console.error('Toggle favorite failed:', error);
        
        setFavorites((prev) => {
          const next = new Set(prev);
          if (wasFavorite) {
            next.add(itemId);
          } else {
            next.delete(itemId);
          }
          return next;
        });
      }
    },
    [favorites]
  );

  const isFavorite = useCallback(
    (itemId: string) => favorites.has(itemId),
    [favorites]
  );

  return {
    favorites,
    toggle,
    isFavorite,
    isPending,
  };
}
