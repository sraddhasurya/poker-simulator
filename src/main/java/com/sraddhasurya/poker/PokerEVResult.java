package com.sraddhasurya.poker;

public class PokerEVResult {
    private final double winProbability;
    private final double tieProbability;
        private final double expectedValue;

    public PokerEVResult(double winProbability, double tieProbability, double expectedValue) {
        this.winProbability = winProbability;
        this.tieProbability = tieProbability;
        this.expectedValue = expectedValue;
    }

    public double getWinProbability() {
        return winProbability;
    }

    public double getTieProbability() {
        return tieProbability;
    }

    public double getExpectedValue() {
        return expectedValue;
    }
}
