package com.sraddhasurya.poker;

import java.util.*;

/**
 * Simulates poker hands to estimate the expected value using Monte Carlo trials
 */
public class PokerEVSimulator {

    private static final String[] SUITS = {"Hearts", "Diamonds", "Clubs", "Spades"};
    private static final int[] RANKS = {2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};

    /**
     * Runs a Monte Carlo simulation to estimate the expected value of calling a bet
     *
     * @param holeCards      player's two hole cards
     * @param communityCards current community cards (flop, turn, river)
     * @param potSize        total pot size
     * @param callAmount     amount the player must call
     * @param numTrials      number of simulations to run
     * @param numPlayers     total number of players (including the user)
     * @return estimated EV of calling the bet
     */
    public static PokerEVResult simulateEV(List<Card> holeCards, List<Card> communityCards, int potSize, int callAmount,int raiseAmount, int numTrials, int numPlayers) {
        int winCount = 0;
        int tieCount = 0;
        int totalContribution=callAmount+raiseAmount;
        int totalPot=potSize+totalContribution;

        for (int i = 0; i < numTrials; i++) {
            List<Card> deck = createDeck();
            deck.removeAll(holeCards);
            deck.removeAll(communityCards);

            Collections.shuffle(deck, new Random());

            // Deal hole cards to all opponents
            List<List<Card>> opponents = new ArrayList<>();
            for (int p = 0; p < numPlayers - 1; p++) {
                List<Card> opponentHole = Arrays.asList(deck.remove(0), deck.remove(0));
                opponents.add(opponentHole);
            }

            // Complete the community cards
            List<Card> fullBoard = new ArrayList<>(communityCards);
            while (fullBoard.size() < 5) {
                fullBoard.add(deck.remove(0));
            }

            // Evaluate player's best hand
            List<Card> playerSeven = new ArrayList<>(holeCards);
            playerSeven.addAll(fullBoard);
            List<Card> bestPlayerHand = BestFiveCards.bestOf(playerSeven);
            int playerStrength = PokerHandEvaluator.getHandStrength(PokerHandEvaluator.classifyHand(bestPlayerHand));

            int strongerOpponents = 0;
            int sameStrengthOpponents = 0;

            for (List<Card> opponentHole : opponents) {
                List<Card> opponentSeven = new ArrayList<>(opponentHole);
                opponentSeven.addAll(fullBoard);

                List<Card> bestOpponentHand = BestFiveCards.bestOf(opponentSeven);
                int opponentStrength = PokerHandEvaluator.getHandStrength(PokerHandEvaluator.classifyHand(bestOpponentHand));

                if (opponentStrength > playerStrength) {
                    strongerOpponents++;
                } else if (opponentStrength == playerStrength) {
                    sameStrengthOpponents++;
                }
            }

            if (strongerOpponents == 0) {
                if (sameStrengthOpponents == 0) {
                    winCount++;
                } else {
                    tieCount++;
                }
            }
        }

        double winProb = winCount / (double) numTrials;
        double tieProb = tieCount / (double) numTrials;
        double ev = (winProb * totalPot) + (tieProb * totalPot / 2) - totalContribution;

        return new PokerEVResult(winProb, tieProb, ev);
    }

    /**
     * Builds a full 52-card deck
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
