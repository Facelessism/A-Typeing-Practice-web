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

describe("Typing Session Completion", () => {
  test("endTypingTest stops the typing session", () => {
    game.setState({
      isTyping: true,
      sessionSaved: false,
    });

    game.endTypingTest();

    expect(game.getState().isTyping).toBe(false);
  });

  test("session statistics are saved to localStorage", () => {
    game.setState({
      totalCorrectChars: 120,
      mistakes: 6,
      keysPressedCount: 126,
      timeLeft: 20,
      sessionSaved: false,
    });

    game.endTypingTest();

    const session = JSON.parse(
      localStorage.getItem(game.constants.LAST_SESSION_KEY)
    );

    expect(session).not.toBeNull();
    expect(session.wpm).toBeDefined();
    expect(session.cpm).toBe(120);
    expect(session.mistakes).toBe(6);
    expect(session.keysPressed).toBe(126);
  });

  test("completed session is appended to history", () => {
    game.setState({
      totalCorrectChars: 80,
      mistakes: 2,
      sessionSaved: false,
    });

    game.endTypingTest();

    const history = JSON.parse(
      localStorage.getItem(game.constants.HISTORY_KEY)
    );

    expect(history).toHaveLength(1);
    expect(history[0]).toHaveProperty("date");
  });

  test("session is saved only once", () => {
    game.setState({
      totalCorrectChars: 75,
      sessionSaved: false,
    });

    game.endTypingTest();
    game.endTypingTest();

    const history = JSON.parse(
      localStorage.getItem(game.constants.HISTORY_KEY)
    );

    expect(history).toHaveLength(1);
  });

  test("input field is cleared after completion", () => {
    game.elements.inpField.value = "developer";

    game.endTypingTest();

    expect(game.elements.inpField.value).toBe("");
  });

  test("keyboard highlights are cleared", () => {
    game.highlightExpectedKey("a");

    expect(document.querySelector(".key.active")).not.toBeNull();

    game.endTypingTest();

    expect(document.querySelector(".key.active")).toBeNull();
  });

  test("timer is stopped after completion", () => {
    jest.useFakeTimers();

    game.setState({
      isTyping: true,
      sessionSaved: false,
    });

    game.endTypingTest();

    expect(game.getState().isTyping).toBe(false);

    jest.useRealTimers();
  });

  test("session stores selected typing mode", () => {
    game.elements.modeSelect.value = "words";

    game.setState({
      totalCorrectChars: 40,
      sessionSaved: false,
    });

    game.endTypingTest();

    const session = JSON.parse(
      localStorage.getItem(game.constants.LAST_SESSION_KEY)
    );

    expect(session.mode).toBe("words");
  });

  test("session stores selected duration", () => {
    game.setState({
      maxTime: 120,
      totalCorrectChars: 50,
      sessionSaved: false,
    });

    game.endTypingTest();

    const session = JSON.parse(
      localStorage.getItem(game.constants.LAST_SESSION_KEY)
    );

    expect(session.duration).toBe(120);
  });

  test("history entry contains all expected fields", () => {
    game.setState({
      totalCorrectChars: 90,
      mistakes: 4,
      keysPressedCount: 94,
      sessionSaved: false,
    });

    game.endTypingTest();

    const entry = JSON.parse(
      localStorage.getItem(game.constants.HISTORY_KEY)
    )[0];

    expect(entry).toEqual(
      expect.objectContaining({
        date: expect.any(String),
        wpm: expect.any(Number),
        cpm: expect.any(Number),
        accuracy: expect.any(Number),
        mistakes: expect.any(Number),
        keysPressed: expect.any(Number),
        mode: expect.any(String),
        duration: expect.any(Number),
      })
    );
  });
});
