import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { EVENTS, STATES, pageMachine } from "./page-machine";
import { useMachine } from "@xstate/react";
import { makeFakePromise } from "./make-fake-promise";

export default function App() {
  const [currentState, send] = useMachine(
    pageMachine.withConfig({
      services: {
        fetch: makeFakePromise,
        save: makeFakePromise
      }
    }),
    { devTools: process.env.NODE_ENV === "development" }
  );

  useEffect(() => {
    send(EVENTS.LOAD, { id: "some id" });
  }, [send]);

  let content = null;

  if (currentState.matches(STATES.LEAVE)) {
    return "redirecting";
  } else if (currentState.matches(STATES.LOADING)) {
    content = "loading";
  } else if (currentState.matches(STATES.READY)) {
    content = (
      <>
        <p>Some form</p>

        {currentState.matches({ [STATES.READY]: STATES.CLEAN }) ? (
          <button type="button" onClick={() => send(EVENTS.MAKE_DIRTY)}>
            Make form dirty
          </button>
        ) : (
          "Form is dirty"
        )}
      </>
    );
  }

  return (
    <>
      <main data-testid="card" style={{ marginBottom: "1rem" }}>
        {content}
      </main>

      <footer>
        <button
          type="button"
          onClick={() => {
            send(EVENTS.LEAVE);
          }}
        >
          Go back
        </button>
        <button type="button" onClick={() => send(EVENTS.SAVE)}>
          Save
        </button>
        <button type="button" onClick={() => send(EVENTS.SAVE_AND_EXIT)}>
          Save and return
        </button>
      </footer>

      {currentState.matches({ [STATES.READY]: STATES.LEAVING }) && "show modal"}
    </>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
