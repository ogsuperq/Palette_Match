import React, { act } from "react";
import { createRoot } from "react-dom/client";
import LandingPage from "./LandingPage";

jest.mock("@/lib/api", () => ({
  API: "https://api.example.com/api",
}), { virtual: true });

describe("LandingPage waitlist", () => {
  let container;
  let originalFetch;
  let root;

  beforeAll(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterAll(() => {
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    originalFetch = global.fetch;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    global.fetch = originalFetch;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("waits for backend confirmation through a cold start before showing success", async () => {
    let confirmRequest;
    global.fetch = jest.fn(() => new Promise((resolve) => {
      confirmRequest = resolve;
    }));

    await act(async () => {
      root.render(<LandingPage />);
    });

    const input = container.querySelector("#waitlist-email");
    const form = container.querySelector("#waitlist");
    const submitButton = form.querySelector('button[type="submit"]');
    const setInputValue = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    ).set;

    act(() => {
      setInputValue.call(input, "cold-start@example.com");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await act(async () => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(submitButton.disabled).toBe(true);
    expect(submitButton.textContent).toContain("Joining");

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(submitButton.disabled).toBe(true);
    expect(container.querySelector("#waitlist-message").textContent).not.toContain(
      "You are on the list",
    );

    await act(async () => {
      confirmRequest({ ok: true });
      await Promise.resolve();
    });

    expect(submitButton.disabled).toBe(false);
    expect(container.querySelector("#waitlist-message").textContent).toContain(
      "You are on the list",
    );
  });
});
