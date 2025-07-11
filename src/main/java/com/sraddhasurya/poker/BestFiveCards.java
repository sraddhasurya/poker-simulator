package com.sraddhasurya.poker;

import java.util.*;

/**
 * Utility class for evaluating the best 5-card poker hand from a set of 7 cards 
 */
public class BestFiveCards {

    public static List<Card> bestOf(List<Card> sevenCards) {
        /**
         * Returns the best possible 5-card poker hand from the 7 cards
         * 
         * @param sevenCards: a list of 7 card objects (2 hole cards and 5 community cards)
         * @return bestHand: a list of 5 card objects representing the best hand
         * @throws IllegalArgumentException if input size is not 7 cards 
         */
        if (sevenCards.size() != 7) {
            throw new IllegalArgumentException("Must provide exactly 7 cards.");
        }

        
        List<List<Card>> combos = getAll5CardCombos(sevenCards);
        List<Card> bestHand = null;
        int bestStrength = -1;

        // Evaluates each 5-card combination and keeps track of the strongest man 
        for (List<Card> combo : combos) {
            String handRank = PokerHandEvaluator.classifyHand(combo);
            int strength = PokerHandEvaluator.getHandStrength(handRank);

            if (strength > bestStrength) {
                bestStrength = strength;
                bestHand = combo;
            }
        }

        return bestHand;
    }

    private static List<List<Card>> getAll5CardCombos(List<Card> cards) {
        /**
         * Determines all the five hand combinations we can get from the seven cards
         * 
         * @param cards: a list of 7 card objects
         * @return combos: a list of 5-card combinations 
         */
        List<List<Card>> combos = new ArrayList<>();
        int n = cards.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                List<Card> hand = new ArrayList<>();
                // Adds all cards exceot the two at indices i and j
                for (int k = 0; k < n; k++) {
                    if (k != i && k != j) {
                        hand.add(cards.get(k));
                    }
                }
                combos.add(hand);
            }
        }
        return combos;
    }
}

