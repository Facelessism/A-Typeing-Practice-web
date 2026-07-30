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
  global.words = ["hello"];
  global.sentences = ["hello world."];
  global.keySets = {
    homeRow: ["asdf"],
  };

  jest.resetModules();
  game = require("../js/script.js");

  localStorage.clear();
});

describe("Game Logic", () => {
  test("resetGame restores default state", () => {
    game.setState({
      timeLeft: 12,
      mistakes: 7,
      charIndex: 4,
      totalCorrectChars: 9,
      keysPressedCount: 18,
      isTyping: true,
    });

    game.resetGame();

    const state = game.getState();

    expect(state.timeLeft).toBe(state.maxTime);
    expect(state.mistakes).toBe(0);
    expect(state.charIndex).toBe(0);
    expect(state.totalCorrectChars).toBe(0);
    expect(state.keysPressedCount).toBe(0);
    expect(state.isTyping).toBe(false);
  });

  test("initTimer decreases remaining time", () => {
    game.setState({
      maxTime: 60,
      timeLeft: 60,
    });

    game.initTimer();

    expect(game.getState().timeLeft).toBe(59);
  });

  test("timer never becomes negative", () => {
    game.setState({
      timeLeft: 0,
    });

    game.initTimer();

    expect(game.getState().timeLeft).toBe(0);
  });

  test("loadTypingContent renders spans", () => {
    game.elements.modeSelect.value = "paragraphs";

    game.loadTypingContent();

    const spans =
      game.elements.typingText.querySelectorAll("span");

    expect(spans.length).toBeGreaterThan(0);
  });

  test("custom mode renders provided text", () => {
    game.elements.modeSelect.value = "custom";

    document.getElementById("custom-text").value =
      "Open Source";

    game.loadCustomText();

    expect(
      game.elements.typingText.textContent
    ).toContain("Open Source");
  });

  test("saveLastSession writes history", () => {
    game.setState({
      totalCorrectChars: 100,
      mistakes: 5,
      keysPressedCount: 105,
      timeLeft: 30,
      sessionSaved: false,
    });

    game.endTypingTest();

    const history = JSON.parse(
      localStorage.getItem(
        game.constants.HISTORY_KEY
      )
    );

    expect(history.length).toBe(1);
    expect(history[0]).toHaveProperty("wpm");
    expect(history[0]).toHaveProperty("accuracy");
    expect(history[0]).toHaveProperty("date");
  });

  test("history respects maximum size", () => {
    const max = game.constants.MAX_HISTORY;

    const entries = [];

    for (let i = 0; i < max + 20; i++) {
      entries.push({
        wpm: i,
      });
    }

    localStorage.setItem(
      game.constants.HISTORY_KEY,
      JSON.stringify(entries)
    );

    game.setState({
      sessionSaved: false,
    });

    game.endTypingTest();

    const history = JSON.parse(
      localStorage.getItem(
        game.constants.HISTORY_KEY
      )
    );

    expect(history.length).toBe(max);
  });

  test("export buttons are disabled with empty history", () => {
    localStorage.clear();

    game.updateExportButtons();

    expect(document.getElementById("export-json").disabled).toBe(
      true
    );

    expect(document.getElementById("export-csv").disabled).toBe(
      true
    );
  });

  test("export buttons are enabled when history exists", () => {
    localStorage.setItem(
      game.constants.HISTORY_KEY,
      JSON.stringify([{ wpm: 10 }])
    );

    game.updateExportButtons();

    expect(document.getElementById("export-json").disabled).toBe(
      false
    );

    expect(document.getElementById("export-csv").disabled).toBe(
      false
    );
  });

  test("keyboard highlighting activates expected key", () => {
    game.highlightExpectedKey("a");

    expect(
      document.querySelector('[data-key="a"]').classList.contains(
        "active"
      )
    ).toBe(true);
  });
});
