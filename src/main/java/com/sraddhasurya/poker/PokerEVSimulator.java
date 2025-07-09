package com.sraddhasurya.poker;

import java.util.*;

public class PokerEVSimulator {

    private static final String[] SUITS = {"Hearts", "Diamonds", "Clubs", "Spades"};
    private static final int[] RANKS = {2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};

    public static double simulateEV(List<Card> holeCards, List<Card> communityCards, int potSize, int callAmount, int numTrials) {
        int winCount = 0;
        int tieCount = 0;

        for (int i = 0; i < numTrials; i++) {
            List<Card> deck = createDeck();
            deck.removeAll(holeCards);
            deck.removeAll(communityCards);

            Collections.shuffle(deck, new Random());

            List<Card> opponentHole = Arrays.asList(deck.remove(0), deck.remove(0));

            List<Card> fullBoard = new ArrayList<>(communityCards);
            while (fullBoard.size() < 5) {
                fullBoard.add(deck.remove(0));
            }

            List<Card> playerSeven = new ArrayList<>(holeCards);
            playerSeven.addAll(fullBoard);
            List<Card> opponentSeven = new ArrayList<>(opponentHole);
            opponentSeven.addAll(fullBoard);

            List<Card> bestPlayerHand = BestFiveCards.bestOf(playerSeven);
            List<Card> bestOpponentHand = BestFiveCards.bestOf(opponentSeven);

            int playerStrength = PokerHandEvaluator.getHandStrength(PokerHandEvaluator.classifyHand(bestPlayerHand));
            int opponentStrength = PokerHandEvaluator.getHandStrength(PokerHandEvaluator.classifyHand(bestOpponentHand));

            if (playerStrength > opponentStrength) winCount++;
            else if (playerStrength == opponentStrength) tieCount++;
        }

        double winProb = winCount / (double) numTrials;
        double tieProb = tieCount / (double) numTrials;

        return (winProb * potSize) + (tieProb * potSize / 2) - callAmount;
    }

    private static List<Card> createDeck() {
        List<Card> deck = new ArrayList<>();
        for (String suit : SUITS) {
            for (int rank : RANKS) {
                deck.add(new Card(suit, rank));
            }
        }
        return deck;
    }
}
