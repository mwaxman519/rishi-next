// Inspired by react-hot-toast library
import * as React from &quot;react&quot;;

// Define the types directly to avoid circular imports
type ToastProps = React.ComponentPropsWithoutRef<
  typeof import(&quot;./toast&quot;).Toast
> & {
  variant?: &quot;default&quot; | &quot;destructive&quot;;
};

type ToastActionElement = React.ReactElement<
  typeof import(&quot;./toast&quot;).ToastAction
>;

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: &quot;ADD_TOAST&quot;,
  UPDATE_TOAST: &quot;UPDATE_TOAST&quot;,
  DISMISS_TOAST: &quot;DISMISS_TOAST&quot;,
  REMOVE_TOAST: &quot;REMOVE_TOAST&quot;,
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType[&quot;ADD_TOAST&quot;];
      toast: ToasterToast;
    }
  | {
      type: ActionType[&quot;UPDATE_TOAST&quot;];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType[&quot;DISMISS_TOAST&quot;];
      toastId: ToasterToast[&quot;id&quot;] | undefined;
    }
  | {
      type: ActionType[&quot;REMOVE_TOAST&quot;];
      toastId: ToasterToast[&quot;id&quot;] | undefined;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: &quot;REMOVE_TOAST&quot;,
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case &quot;ADD_TOAST&quot;:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case &quot;UPDATE_TOAST&quot;:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      };

    case &quot;DISMISS_TOAST&quot;: {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case &quot;REMOVE_TOAST&quot;:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, &quot;id&quot;>;

function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: &quot;UPDATE_TOAST&quot;,
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: &quot;DISMISS_TOAST&quot;, toastId: id });

  dispatch({
    type: &quot;ADD_TOAST&quot;,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      dispatch({
        type: &quot;DISMISS_TOAST&quot;,
        toastId: toastId || undefined,
      }),
  };
}

export { useToast, toast };
