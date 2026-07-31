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

describe("Timer Lifecycle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("timer starts when typing begins", () => {
    game.setState({
      isTyping: false,
      timeLeft: 60,
    });

    game.elements.inpField.value = "h";
    game.initTyping();

    expect(game.getState().isTyping).toBe(true);
  });

  test("timer decreases once every second", () => {
    game.setState({
      maxTime: 60,
      timeLeft: 60,
    });

    game.initTimer();

    expect(game.getState().timeLeft).toBe(59);

    game.initTimer();

    expect(game.getState().timeLeft).toBe(58);
  });

  test("timer updates displayed time", () => {
    game.setState({
      maxTime: 60,
      timeLeft: 60,
    });

    game.initTimer();

    expect(
      document.querySelector(".time span b").textContent
    ).toBe("59");
  });

  test("timer updates WPM display while running", () => {
    game.setState({
      totalCorrectChars: 50,
      maxTime: 60,
      timeLeft: 50,
    });

    game.initTimer();

    expect(
      Number(document.querySelector(".wpm span").textContent)
    ).toBeGreaterThanOrEqual(0);
  });

  test("timer reaches zero correctly", () => {
    game.setState({
      timeLeft: 1,
      sessionSaved: false,
    });

    game.initTimer();

    expect(game.getState().timeLeft).toBe(0);
  });

  test("timer completion ends the typing session", () => {
    game.setState({
      timeLeft: 0,
      isTyping: true,
      sessionSaved: false,
    });

    game.initTimer();

    expect(game.getState().isTyping).toBe(false);
  });

  test("timer completion saves the session", () => {
    game.setState({
      timeLeft: 0,
      totalCorrectChars: 60,
      sessionSaved: false,
    });

    game.initTimer();

    const session = JSON.parse(
      localStorage.getItem(game.constants.LAST_SESSION_KEY)
    );

    expect(session).not.toBeNull();
  });

  test("timer completion appends history", () => {
    game.setState({
      timeLeft: 0,
      totalCorrectChars: 80,
      sessionSaved: false,
    });

    game.initTimer();

    const history = JSON.parse(
      localStorage.getItem(game.constants.HISTORY_KEY)
    );

    expect(history).toHaveLength(1);
  });

  test("timer never becomes negative", () => {
    game.setState({
      timeLeft: 0,
      sessionSaved: false,
    });

    game.initTimer();
    game.initTimer();

    expect(game.getState().timeLeft).toBe(0);
  });

  test("resetGame restores timer after it has been running", () => {
    game.setState({
      maxTime: 120,
      timeLeft: 35,
      isTyping: true,
    });

    game.resetGame();

    const state = game.getState();

    expect(state.timeLeft).toBe(120);
    expect(state.isTyping).toBe(false);

    expect(
      document.querySelector(".time span b").textContent
    ).toBe("120");
  });
});
