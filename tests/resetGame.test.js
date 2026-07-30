/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.resolve(__dirname, "../index.html"),
  "utf8"
);

let game;

beforeEach(() => {
  document.documentElement.innerHTML = html;

  global.paragraphs = ["hello world"];
  global.words = ["developer"];
  global.sentences = ["Testing sentence."];
  global.keySets = {
    homeRow: ["asdf"],
  };

  localStorage.clear();

  jest.resetModules();
  game = require("../js/script.js");
});

describe("resetGame()", () => {
  test("restores all runtime state variables", () => {
    game.setState({
      maxTime: 120,
      timeLeft: 48,
      charIndex: 11,
      mistakes: 6,
      totalCorrectChars: 32,
      keysPressedCount: 41,
      isTyping: true,
      sessionSaved: true,
    });

    game.resetGame();

    const state = game.getState();

    expect(state.timeLeft).toBe(state.maxTime);
    expect(state.charIndex).toBe(0);
    expect(state.mistakes).toBe(0);
    expect(state.totalCorrectChars).toBe(0);
    expect(state.keysPressedCount).toBe(0);
    expect(state.isTyping).toBe(false);
    expect(state.sessionSaved).toBe(false);
  });

  test("clears the input field", () => {
    game.elements.inpField.value = "hello";

    game.resetGame();

    expect(game.elements.inpField.value).toBe("");
  });

  test("resets displayed statistics", () => {
    game.resetGame();

    expect(document.querySelector(".wpm span").textContent).toBe("0");
    expect(document.querySelector(".cpm span").textContent).toBe("0");
    expect(document.querySelector(".mistake span").textContent).toBe("0");
    expect(document.querySelector(".progress span").textContent).toBe("0%");
    expect(document.querySelector(".accuracy span").textContent).toBe("100%");
    expect(document.querySelector(".charCount span").textContent).toBe("0");
  });

  test("restores the timer display", () => {
    game.setState({
      maxTime: 60,
      timeLeft: 20,
    });

    game.resetGame();

    expect(
      document.querySelector(".time span b").textContent
    ).toBe("60");
  });

  test("loads fresh typing content", () => {
    game.elements.modeSelect.value = "paragraphs";

    game.resetGame();

    expect(game.elements.typingText.querySelectorAll("span").length)
      .toBeGreaterThan(0);
  });

  test("activates the first character", () => {
    game.resetGame();

    const first =
      game.elements.typingText.querySelector("span");

    expect(first).not.toBeNull();
    expect(first.classList.contains("active")).toBe(true);
  });

  test("highlights the expected keyboard key", () => {
    game.resetGame();

    expect(
      document.querySelector(".key.active")
    ).not.toBeNull();
  });

  test("clears any running timer", () => {
    jest.useFakeTimers();

    game.setState({
      isTyping: true,
    });

    game.resetGame();

    expect(game.getState().isTyping).toBe(false);

    jest.useRealTimers();
  });

  test("does not remove typing history", () => {
    localStorage.setItem(
      game.constants.HISTORY_KEY,
      JSON.stringify([{ wpm: 80 }])
    );

    game.resetGame();

    expect(
      JSON.parse(
        localStorage.getItem(game.constants.HISTORY_KEY)
      )
    ).toHaveLength(1);
  });
});
