import { Machine, assign } from "xstate";

export const STATES = {
  IDLE: "idle",
  CLEAN: "clean",
  DIRTY: "dirty",
  LEAVE: "leave",
  LEAVING: "leaving",
  LOADING: "loading",
  LOADING_ERROR: "loadingError",
  READY: "ready",
  SAVING: "saving",
  SAVING_ERROR: "savingError"
};

export const EVENTS = {
  LEAVE: "LEAVE",
  LEAVE_CANCEL: "LEAVE_CANCEL",
  LOAD: "LOAD",
  MAKE_DIRTY: "MAKE_DIRTY",
  MAKE_READY: "MAKE_READY",
  SAVE: "SAVE",
  SAVE_AND_EXIT: "SAVE_AND_EXIT"
};

export const pageMachine = Machine(
  {
    id: "pageMachine",
    initial: STATES.IDLE,
    context: {
      shouldExit: false
    },
    states: {
      [STATES.IDLE]: {
        on: {
          [EVENTS.LOAD]: STATES.LOADING
        },
        meta: {
          test: ({ getByTestId }) => {
            getByTestId("card");
          }
        }
      },
      [STATES.LOADING]: {
        invoke: {
          src: "fetch",
          onDone: STATES.READY,
          onError: STATES.LOADING_ERROR
        },
        meta: {
          test: ({ getByTestId }) => {
            getByTestId("loading");
          }
        }
      },
      [STATES.READY]: {
        on: {
          [EVENTS.MAKE_DIRTY]: `.${STATES.DIRTY}`,
          [EVENTS.SAVE]: {
            target: `.${STATES.SAVING}`,
            actions: assign({ shouldExit: false })
          }
        },
        initial: STATES.CLEAN,
        states: {
          [STATES.CLEAN]: {
            on: {
              [EVENTS.SAVE]: {
                target: STATES.SAVING,
                actions: assign({ shouldExit: false })
              },
              [EVENTS.SAVE_AND_EXIT]: {
                target: STATES.SAVING,
                actions: assign({ shouldExit: true })
              },
              [EVENTS.LEAVE]: `#pageMachine.${STATES.LEAVING}`
            },
            meta: {
              test: ({ getByText }) => {
                getByText(/^make dirty$/i);
              }
            }
          },
          [STATES.DIRTY]: {
            on: {
              [EVENTS.SAVE]: {
                target: STATES.SAVING,
                actions: assign({ shouldExit: false })
              },
              [EVENTS.SAVE_AND_EXIT]: {
                target: STATES.SAVING,
                actions: assign({ shouldExit: true })
              },
              [EVENTS.LEAVE]: `#pageMachine.${STATES.LEAVING}`
            },
            meta: {
              test: ({ getByText }) => {
                getByText(/^dirty$/i);
              }
            }
          },
          [STATES.SAVING]: {
            invoke: {
              src: "save",
              onDone: [
                {
                  target: `#pageMachine.${STATES.LEAVE}`,
                  cond: "shouldExitAfterSave"
                },
                {
                  target: STATES.CLEAN
                }
              ],
              onError: STATES.SAVING_ERROR
            },
            meta: {
              test: ({ getByText }) => {
                getByText(/^saving$/i);
              }
            }
          },
          [STATES.SAVING_ERROR]: {
            on: {
              [EVENTS.SAVE]: {
                target: STATES.SAVING,
                actions: assign({ shouldExit: false })
              },
              [EVENTS.SAVE_AND_EXIT]: {
                target: STATES.SAVING,
                actions: assign({ shouldExit: true })
              },
              [EVENTS.LEAVE]: `#pageMachine.${STATES.LEAVING}`
            },
            meta: {
              test: ({ getByText }) => {
                getByText(/^save error$/i);
              }
            }
          }
        }
      },
      [STATES.LOADING_ERROR]: {
        on: {
          [EVENTS.LOAD]: STATES.LOADING
        },
        meta: {
          test: ({ getByText }) => {
            getByText(/error, yo/i);
          }
        }
      },
      [STATES.LEAVING]: {
        on: {
          [EVENTS.LEAVE_CANCEL]: `${STATES.READY}.${STATES.DIRTY}`
        },
        meta: {
          test: ({ getByText }) => {
            getByText(/leave without saving/i);
          }
        }
      },
      [STATES.LEAVE]: {
        meta: {
          test: ({ getByTestId }) => {
            getByTestId("leave");
          }
        }
      }
    }
  },
  {
    guards: {
      shouldExitAfterSave: ctx => ctx.shouldExit
    }
  }
);
