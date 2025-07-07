package com.sraddhasurya.poker;
import java.util.*;




public class HandProbabilities {
    private final Card card1;
    private final Card card2;

    public HandProbabilities(List<Card> holeCards) {
        this.card1 = holeCards.get(0);
        this.card2 = holeCards.get(1);
    }

    public double chanceOfPair(List<Card> flipped) {
        if (card1.isPair(card2)) return 1.0;
        for (Card card : flipped) {
            if (card.isPair(card1) || card.isPair(card2)) return 1.0;
        }

        int known = 2 + flipped.size();
        int unseen = 52 - known;
        int toBeRevealed = 5 - flipped.size();
        if (toBeRevealed == 0) return 0.0;

        double probForOneCard = 3.0 / unseen;
        double probNoPair = Math.pow(1 - probForOneCard, 2 * toBeRevealed);
        return 1 - probNoPair;
    }

    public double chanceOfTwoPair(List<Card> flipped) {
        if (card1.isPair(card2)) return 0.0;

        boolean oneHasPair = flipped.stream().anyMatch(c -> c.isPair(card1));
        boolean twoHasPair = flipped.stream().anyMatch(c -> c.isPair(card2));
        if (oneHasPair && twoHasPair) return 1.0;

        int known = 2 + flipped.size();
        int unseen = 52 - known;
        int toBeRevealed = 5 - flipped.size();
        if (toBeRevealed == 0) return 0.0;

        double probPairOne = 1 - Math.pow((unseen - 3.0) / unseen, toBeRevealed);
        if (oneHasPair || twoHasPair) return probPairOne;

        double probPairTwo = 1 - Math.pow((unseen - 4.0) / (unseen - 1), toBeRevealed);
        return probPairOne * probPairTwo;
    }

    public double chanceOfThreeOfKind(List<Card> flipped) {
        int matches = 0;
        for (Card card : flipped) {
            if (card.isPair(card1) || card.isPair(card2)) matches++;
        }

        if (card1.isPair(card2) && matches >= 1) return 1.0;
        if (matches >= 2) return 1.0;

        int known = 2 + flipped.size();
        int unseen = 52 - known;
        int toBeRevealed = 5 - flipped.size();
        if (toBeRevealed == 0) return 0.0;

        if (card1.isPair(card2)) {
            return 1 - Math.pow((unseen - 2.0) / unseen, toBeRevealed);
        } else {
            double p1 = 1 - Math.pow((unseen - 3.0) / unseen, toBeRevealed);
            double p2 = 1 - Math.pow((unseen - 5.0) / (unseen - 1), toBeRevealed);
            return p1 * p2;
        }
    }

    public double chanceOfFlush(List<Card> flipped) {
        Map<String, Integer> suitCounts = new HashMap<>();
        suitCounts.put("hearts", 0);
        suitCounts.put("diamonds", 0);
        suitCounts.put("clubs", 0);
        suitCounts.put("spades", 0);

        List<Card> allCards = new ArrayList<>(flipped);
        allCards.add(card1);
        allCards.add(card2);

        for (Card c : allCards) {
            suitCounts.put(c.getSuit(), suitCounts.get(c.getSuit()) + 1);
        }

        int cardsSeen = allCards.size();
        int unseen = 52 - cardsSeen;
        int toReveal = 5 - flipped.size();
        if (toReveal == 0) return 0.0;

        double maxProb = 0.0;
        for (Map.Entry<String, Integer> entry : suitCounts.entrySet()) {
            int count = entry.getValue();
            if (count >= 5) return 1.0;

            int needed = 5 - count;
            if (needed > toReveal) continue;

            int remainingSuitCards = 13 - count;
            double prob = 1.0;
            for (int i = 0; i < needed; i++) {
                prob *= (double)(remainingSuitCards - i) / (unseen - i);
            }

            maxProb = Math.max(maxProb, prob);
        }

        return Math.min(maxProb, 1.0);
    }

    public double chanceOfStraight(List<Card> flipped) {
        List<Integer> values = new ArrayList<>();
        values.add(card1.getNumber());
        values.add(card2.getNumber());
        for (Card c : flipped) values.add(c.getNumber());

        Collections.sort(values);

        for (int i = 0; i <= values.size() - 5; i++) {
            int first = values.get(i);
            if (values.subList(i, Math.min(i + 5, values.size())).equals(List.of(first, first+1, first+2, first+3, first+4)))
                return 1.0;
        }

        int seen = values.size();
        int unseen = 52 - seen;
        int toReveal = 5 - flipped.size();
        if (toReveal == 0) return 0.0;

        double straightProb = 0.0;
        for (int start = 2; start <= 10; start++) {
            Set<Integer> needed = new HashSet<>();
            for (int i = 0; i < 5; i++) needed.add(start + i);

            Set<Integer> have = new HashSet<>(values);
            needed.removeAll(have);

            if (needed.size() > 0 && needed.size() <= toReveal) {
                double prob = 1.0;
                int i = 0;
                for (Integer val : needed) {
                    prob *= 4.0 / (unseen - i); // assume 4 per rank
                    i++;
                }
                straightProb += prob;
            }
        }

        return Math.min(straightProb, 1.0);
    }

    public double chanceOfFourOfKind(List<Card> flipped) {
        Map<Integer, Integer> counts = new HashMap<>();
        List<Card> all = new ArrayList<>(flipped);
        all.add(card1);
        all.add(card2);

        for (Card c : all) {
            counts.put(c.getNumber(), counts.getOrDefault(c.getNumber(), 0) + 1);
        }

        if (counts.values().stream().anyMatch(c -> c >= 4)) return 1.0;

        int seen = all.size();
        int unseen = 52 - seen;
        int toReveal = 5 - flipped.size();
        if (toReveal == 0) return 0.0;

        double maxProb = 0.0;
        for (Map.Entry<Integer, Integer> entry : counts.entrySet()) {
            int count = entry.getValue();
            if (count >= 4) continue;
            int needed = 4 - count;
            if (needed > toReveal) continue;

            double prob = 1.0;
            for (int i = 0; i < needed; i++) {
                prob *= (double)(4 - count - i) / (unseen - i);
            }

            maxProb = Math.max(maxProb, prob);
        }

        return maxProb;
    }

    public double chanceOfFullHouse(List<Card> flipped) {
        Map<Integer, Integer> counts = new HashMap<>();
        List<Card> all = new ArrayList<>(flipped);
        all.add(card1);
        all.add(card2);

        for (Card c : all) {
            counts.put(c.getNumber(), counts.getOrDefault(c.getNumber(), 0) + 1);
        }

        boolean hasThree = counts.values().stream().anyMatch(c -> c >= 3);
        Integer tripleVal = counts.entrySet().stream().filter(e -> e.getValue() >= 3).map(Map.Entry::getKey).findFirst().orElse(null);
        boolean hasPair = counts.entrySet().stream()
            .anyMatch(e -> e.getValue() >= 2 && (tripleVal == null || !e.getKey().equals(tripleVal)));

        if (hasThree && hasPair) return 1.0;
        int toReveal = 5 - flipped.size();
        if (toReveal == 0) return 0.0;

        if (hasThree) {
            int unseen = 52 - all.size();
            return 1 - Math.pow((unseen - 3.0) / unseen, toReveal);
        }

        double p1 = chanceOfPair(flipped);
        double p2 = chanceOfThreeOfKind(flipped);
        return p1 * p2;
    }

    public double chanceOfStraightFlush(List<Card> flipped) {
        Map<String, Set<Integer>> suitToVals = new HashMap<>();
        suitToVals.put("hearts", new HashSet<>());
        suitToVals.put("diamonds", new HashSet<>());
        suitToVals.put("clubs", new HashSet<>());
        suitToVals.put("spades", new HashSet<>());

        List<Card> all = new ArrayList<>(flipped);
        all.add(card1);
        all.add(card2);

        for (Card c : all) {
            suitToVals.get(c.getSuit()).add(c.getNumber());
        }

        for (Set<Integer> nums : suitToVals.values()) {
            for (int start = 1; start <= 10; start++) {
                boolean match = true;
                for (int i = 0; i < 5; i++) {
                    if (!nums.contains(start + i)) {
                        match = false;
                        break;
                    }
                }
                if (match) return 1.0;
            }
        }

        int toReveal = 5 - flipped.size();
        int unseen = 52 - all.size();
        if (toReveal == 0) return 0.0;

        double maxProb = 0.0;
        for (Set<Integer> nums : suitToVals.values()) {
            for (int start = 1; start <= 10; start++) {
                Set<Integer> needed = new HashSet<>();
                for (int i = 0; i < 5; i++) needed.add(start + i);
                needed.removeAll(nums);
                if (needed.size() > toReveal) continue;

                double prob = 1.0;
                int i = 0;
                for (Integer val : needed) {
                    prob *= (1.0 / (unseen - i)) * 4; // overestimate
                    i++;
                }
                maxProb = Math.max(maxProb, prob);
            }
        }

        return Math.min(maxProb, 1.0);
    }
}

