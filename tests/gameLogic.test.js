if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    calculateWPM,
    calculateProgress,
    calculateAccuracy,
    calculateKeyspressed,

    initTyping,
    initTimer,
    resetGame,
    endTypingTest,
    loadTypingContent,

    getState: () => ({
      timeLeft,
      maxTime,
      mistakes,
      totalCorrectChars,
      charIndex,
      keysPressedCount,
      isTyping,
    }),
  };
}
