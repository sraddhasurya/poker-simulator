package com.sraddhasurya.poker;

import java.util.*;
import java.util.stream.Collectors;

public class PokerHandEvaluator {
    private static final Map<String, Integer> HAND_STRENGTH = Map.ofEntries(
        Map.entry("High Card", 0),
        Map.entry("One Pair", 1),
        Map.entry("Two Pair", 2),
        Map.entry("Three of a Kind", 3),
        Map.entry("Straight", 4),
        Map.entry("Flush", 5),
        Map.entry("Full House", 6),
        Map.entry("Four of a Kind", 7),
        Map.entry("Straight Flush", 8)
    );

    public static String classifyHand(List<Card> hand) {
        List<Integer> values = hand.stream().map(Card::getNumber).sorted().collect(Collectors.toList());
        List<String> suits = hand.stream().map(Card::getSuit).collect(Collectors.toList());
        Map<Integer, Long> counts = values.stream().collect(Collectors.groupingBy(v -> v, Collectors.counting()));
        Collection<Long> freqs = counts.values();

        boolean isFlush = new HashSet<>(suits).size() == 1;
        boolean isStraight = isConsecutive(values);

        if (isFlush && isStraight) return "Straight Flush";
        if (freqs.contains(4L)) return "Four of a Kind";
        if (freqs.contains(3L) && freqs.contains(2L)) return "Full House";
        if (isFlush) return "Flush";
        if (isStraight) return "Straight";
        if (freqs.contains(3L)) return "Three of a Kind";
        if (Collections.frequency(freqs, 2L) == 2) return "Two Pair";
        if (freqs.contains(2L)) return "One Pair";
        return "High Card";
    }

    private static boolean isConsecutive(List<Integer> values) {
        Set<Integer> set = new TreeSet<>(values);
        List<Integer> list = new ArrayList<>(set);
        for (int i = 0; i <= list.size() - 5; i++) {
            if (list.get(i + 4) - list.get(i) == 4) return true;
        }
        // Ace-low straight
        return set.containsAll(Set.of(2, 3, 4, 5, 14));
    }

    public static int getHandStrength(String hand) {
        return HAND_STRENGTH.getOrDefault(hand, -1);
    }
}

