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

  global.paragraphs = [
    "Paragraph Test",
  ];

  global.words = [
    "Developer",
  ];

  global.sentences = [
    "Testing sentence."
  ];

  global.keySets = {
    homeRow: [
      "asdf"
    ],
    topRow: [
      "qwerty"
    ]
  };

  jest.resetModules();

  game = require("../js/script.js");
});

describe("Typing Modes", () => {
  test("paragraph mode loads paragraph dataset", () => {
    game.elements.modeSelect.value = "paragraphs";

    game.loadTypingContent();

    expect(
      game.elements.typingText.textContent
    ).toBe("Paragraph Test");
  });

  test("words mode loads words dataset", () => {
    game.elements.modeSelect.value = "words";

    game.loadTypingContent();

    expect(
      game.elements.typingText.textContent
    ).toBe("Developer");
  });

  test("sentences mode loads sentence dataset", () => {
    game.elements.modeSelect.value = "sentences";

    game.loadTypingContent();

    expect(
      game.elements.typingText.textContent
    ).toBe("Testing sentence.");
  });

  test("specificKey mode loads selected key practice", () => {
    game.elements.modeSelect.value = "specificKey";
    game.elements.keySelect.value = "homeRow";

    game.loadTypingContent();

    expect(
      game.elements.typingText.textContent
    ).toBe("asdf");
  });

  test("custom mode loads custom text", () => {
    game.elements.modeSelect.value = "custom";

    document.getElementById("custom-text").value =
      "OpenAI";

    game.loadCustomText();

    expect(
      game.elements.typingText.textContent
    ).toBe("OpenAI");
  });

  test("empty custom text renders nothing", () => {
    game.elements.modeSelect.value = "custom";

    document.getElementById("custom-text").value = "";

    game.loadTypingContent();

    expect(
      game.elements.typingText.children.length
    ).toBe(0);
  });
});
