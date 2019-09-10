import React from "react";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { createModel } from "@xstate/test";
import { makeFakePromise } from "./make-fake-promise";
import { pageMachine } from "./page-machine";
import App from "./App";

describe("page", () => {
  const testModel = createModel(
    pageMachine.withConfig({
      fetch: makeFakePromise,
      save: makeFakePromise
    })
  ).withEvents({
    LEAVE: ({ getByText }) => {
      fireEvent.click(getByText(/go back/i));
    },
    LEAVE_CANCEL: ({ getByText }) => {
      fireEvent.click(getByText(/^cancel$/i));
    },
    LOAD: ({ getByText }) => {
      // noop
    },
    MAKE_DIRTY: ({ getByText }) => {
      fireEvent.click(getByText(/^make form dirty$/i));
    },
    SAVE: ({ getByText }) => {
      fireEvent.click(getByText(/^save$/i));
    },
    SAVE_AND_EXIT: ({ getByText }) => {
      fireEvent.click(getByText(/^save and return$/i));
    },
    "done.invoke.fetch": () => {}
  });

  const testPlans = testModel.getShortestPathPlans();
  testPlans.forEach(plan => {
    describe(plan.description, () => {
      afterEach(cleanup);

      plan.paths.forEach(path => {
        it(path.description, () => {
          const rendered = render(<App />);
          return path.test(rendered);
        });
      });
    });
  });

  it("should have full coverage", () => {
    testModel.testCoverage();
  });
});
