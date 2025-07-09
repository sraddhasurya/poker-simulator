package com.sraddhasurya.poker;

import java.util.*;

public class BestFiveCards {

    public static List<Card> bestOf(List<Card> sevenCards) {
        if (sevenCards.size() != 7) {
            throw new IllegalArgumentException("Must provide exactly 7 cards.");
        }

        List<List<Card>> combos = getAll5CardCombos(sevenCards);
        List<Card> bestHand = null;
        int bestStrength = -1;

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
        List<List<Card>> combos = new ArrayList<>();
        int n = cards.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                List<Card> hand = new ArrayList<>();
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

