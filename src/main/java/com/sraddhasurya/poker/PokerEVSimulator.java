package com.sraddhasurya.poker;

import java.util.*;

/**
 * Simulates poker hands to estimate the expected value  using Monte Carlo trials 
 */
public class PokerEVSimulator {

    private static final String[] SUITS = {"Hearts", "Diamonds", "Clubs", "Spades"};
    private static final int[] RANKS = {2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};

    /**
     * Runs a Monte Carlo simulation to estimate the expected values of calling a bet 
     * 
     * @param holeCards player's two hole cards
     * @param communityCards current community cars (flop, turn, river)
     * @param potSize total pot size
     * @param callAmount amount the player must call
     * @param numTrials number of simulations to run 
     * @return estimated EV of calling the bet
     */
    public static double simulateEV(List<Card> holeCards, List<Card> communityCards, int potSize, int callAmount, int numTrials) {
        int winCount = 0;
        int tieCount = 0;

        for (int i = 0; i < numTrials; i++) {
            List<Card> deck = createDeck();
            deck.removeAll(holeCards);
            deck.removeAll(communityCards);

            Collections.shuffle(deck, new Random());

            List<Card> opponentHole = Arrays.asList(deck.remove(0), deck.remove(0));    //Simulates a random opponent hand 

            //Completes the board if it's not full
            List<Card> fullBoard = new ArrayList<>(communityCards);
            while (fullBoard.size() < 5) {
                fullBoard.add(deck.remove(0));
            }

            List<Card> playerSeven = new ArrayList<>(holeCards);
            playerSeven.addAll(fullBoard);
            List<Card> opponentSeven = new ArrayList<>(opponentHole);
            opponentSeven.addAll(fullBoard);

            //Get best 5-card hands
            List<Card> bestPlayerHand = BestFiveCards.bestOf(playerSeven);
            List<Card> bestOpponentHand = BestFiveCards.bestOf(opponentSeven);

            //Compares hand strengths
            int playerStrength = PokerHandEvaluator.getHandStrength(PokerHandEvaluator.classifyHand(bestPlayerHand));
            int opponentStrength = PokerHandEvaluator.getHandStrength(PokerHandEvaluator.classifyHand(bestOpponentHand));

            if (playerStrength > opponentStrength) winCount++;
            else if (playerStrength == opponentStrength) tieCount++;
        }

        double winProb = winCount / (double) numTrials;
        double tieProb = tieCount / (double) numTrials;

        // EV=(win chance * pot) + (tie chance * half pot) - call cost
        return (winProb * potSize) + (tieProb * potSize / 2) - callAmount;
    }

    /**
     * Builds a full 52-card deck
     * @return a list of all cards in the deck
     */
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
