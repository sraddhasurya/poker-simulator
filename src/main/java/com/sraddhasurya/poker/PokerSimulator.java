package com.sraddhasurya.poker;

import java.util.*;

public class PokerSimulator {

    private static final String[] SUITS = {"Hearts", "Diamonds", "Clubs", "Spades"};
    private static final int[] RANKS = {2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14};

    public static Map<String, Double> simulate(int numTrials) {
        Map<String, Integer> resultCounts = new HashMap<>();

        List<Card> deck = new ArrayList<>();
        for (String suit : SUITS) {
            for (int rank : RANKS) {
                deck.add(new Card(suit,rank));
            }
        }

        Random rand = new Random();

        for (int i = 0; i < numTrials; i++) {
            Collections.shuffle(deck, rand);
            List<Card> sevenCards = deck.subList(0, 7);
            List<List<Card>> allCombinations = getAll5CardCombos(sevenCards);

            String bestRank = null;
            int bestStrength = -1;

            for (List<Card> hand : allCombinations) {
                String rank = PokerHandEvaluator.classifyHand(hand);
                int strength = PokerHandEvaluator.getHandStrength(rank);
                if (strength > bestStrength) {
                    bestStrength = strength;
                    bestRank = rank;
                }
            }

            resultCounts.put(bestRank, resultCounts.getOrDefault(bestRank, 0) + 1);
        }

        Map<String, Double> probabilities = new HashMap<>();
        for (Map.Entry<String, Integer> entry : resultCounts.entrySet()) {
            probabilities.put(entry.getKey(), entry.getValue() / (double) numTrials);
        }

        return probabilities;
    }

    private static List<List<Card>> getAll5CardCombos(List<Card> cards) {
        List<List<Card>> combos = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            for (int j = i + 1; j < 7; j++) {
                List<Card> hand = new ArrayList<>();
                for (int k = 0; k < 7; k++) {
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

