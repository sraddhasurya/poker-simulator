package com.sraddhasurya.poker;
import java.util.*;


/**
 * Computes the probability of getting specific poker hands give the players hole cards and the currently revealed community cards
 */
public class HandProbabilities {
    private final Card card1;
    private final Card card2;
    private final int numPlayers;

    /**
     * Constructs a HandProbabilities object using two hole cards
     * 
     * @param holeCards a list of exactly 2 hole cards 
     */
    public HandProbabilities(List<Card> holeCards, int numPlayers) {
        this.card1 = holeCards.get(0);
        this.card2 = holeCards.get(1);
        this.numPlayers=numPlayers;
    }

    /**
     * Probability of forming one pair 
     */
    public double chanceOfPair(List<Card> flipped) {
        if (card1.isPair(card2)) return 1.0;
        for (Card card : flipped) {
            if (card.isPair(card1) || card.isPair(card2)) return 1.0;
        }

        int known = 2 + flipped.size();
        int unseen = 52 - known - (2 * (numPlayers - 1));
        int toBeRevealed = 5 - flipped.size();
        if (toBeRevealed == 0) return 0.0;

        double probForOneCard = 3.0 / unseen;
        double probNoPair = Math.pow(1 - probForOneCard, 2 * toBeRevealed);
        return 1 - probNoPair;
    }
    /*
     * Probability of getting two pairs (not counting any pairs we may get in the community cards)
     */
    public double chanceOfTwoPair(List<Card> flipped) {
        if (card1.isPair(card2)) return 0.0;

        boolean oneHasPair = false;
        for (Card c : flipped) {
            if (c.isPair(card1)) {
                oneHasPair = true;
                break; 
            }
        }
        boolean twoHasPair=false;
        for (Card c : flipped) {
            if (c.isPair(card2)) {
                twoHasPair = true;
                break; 
            }
        }
        if (oneHasPair && twoHasPair) return 1.0;

        int known = 2 + flipped.size();
        int unseen = 52 - known - (2 * (numPlayers - 1));
        int toBeRevealed = 5 - flipped.size();
        if (toBeRevealed == 0) return 0.0;


        double probPairOne = 1 - Math.pow((unseen - 3.0) / unseen, toBeRevealed);
        if (oneHasPair || twoHasPair) return probPairOne;   //if we have one pair

        double probPairTwo = 1 - Math.pow((unseen - 4.0) / (unseen - 1), toBeRevealed);
        return probPairOne * probPairTwo;
    }

    public double chanceOfThreeOfKind(List<Card> flipped) {
        /*
         * Calculates the probability of getting three of a kind
         */
        int matches = 0;
        for (Card card : flipped) {
            if (card.isPair(card1) || card.isPair(card2)) matches++;
        }

        if (card1.isPair(card2) && matches >= 1) return 1.0;
        if (matches >= 2) return 1.0;

        int known = 2 + flipped.size();
        int unseen = 52 - known - (2 * (numPlayers - 1));
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
        /*
         * Probability of getting a flush
         */
        Map<String, Integer> suitCounts = new HashMap<>();
        suitCounts.put("hearts", 0);
        suitCounts.put("diamonds", 0);
        suitCounts.put("clubs", 0);
        suitCounts.put("spades", 0);

        List<Card> allCards = new ArrayList<>(flipped);
        allCards.add(card1);
        allCards.add(card2);

        for (Card c : allCards) {
            suitCounts.put(c.getSuit(), suitCounts.get(c.getSuit()) + 1);   //Adds frequency of each suit to hashmap
        }

        int cardsSeen = allCards.size();
        int unseen = 52 - cardsSeen - (2 * (numPlayers - 1));
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
        /*
         * Calculates the probabilty of getting a straight
         */
        List<Integer> values = new ArrayList<>();
        values.add(card1.getNumber());
        values.add(card2.getNumber());
        for (Card c : flipped) values.add(c.getNumber());

        Collections.sort(values);

        for (int i = 0; i <= values.size() - 5; i++) {
            int first = values.get(i);
            if (values.subList(i, Math.min(i + 5, values.size())).equals(List.of(first, first+1, first+2, first+3, first+4)))   //Already have a flush
                return 1.0;
        }

        int seen = values.size();
        int unseen = 52 - seen - (2 * (numPlayers - 1));
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
        /*
         * Probability of getting four of a kind
         */
        Map<Integer, Integer> counts = new HashMap<>();
        List<Card> all = new ArrayList<>(flipped);
        all.add(card1);
        all.add(card2);

        for (Card c : all) {
            counts.put(c.getNumber(), counts.getOrDefault(c.getNumber(), 0) + 1);   //Maps frequency of each number
        }

        for (int count:counts.values()){
            if (count==4){
                return 1.0;
            }
        }

        int seen = all.size();
        int unseen = 52 - seen - (2 * (numPlayers - 1));
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
        /*
         * Calculates the probability of getting a full house 
         */
        Map<Integer, Integer> counts = new HashMap<>();
        List<Card> all = new ArrayList<>(flipped);
        all.add(card1);
        all.add(card2);

        for (Card c : all) {
            counts.put(c.getNumber(), counts.getOrDefault(c.getNumber(), 0) + 1);   //Maps frequency of each number
        }

        boolean hasThree = false;
        for(Integer count:counts.values()){
            if(count>=3){
                hasThree=true;
                break;
            }
        }

        Integer tripleVal = null;
        for (Map.Entry<Integer, Integer> entry : counts.entrySet()) {
            if (entry.getValue() >= 3) {
                tripleVal = entry.getKey();
                break;
            }
        }

        boolean hasPair = false;
        for (Map.Entry<Integer, Integer> entry : counts.entrySet()) {
            int rank = entry.getKey();
            int count = entry.getValue();
            if (count >= 2) {
                if (tripleVal == null || rank != tripleVal) {
                    hasPair = true;
                    break; 
                }
            }
        }
        

        if (hasThree && hasPair) return 1.0;
        int toReveal = 5 - flipped.size();
        if (toReveal == 0) return 0.0;

        if (hasThree) {
            int unseen = 52 - all.size() - (2 * (numPlayers - 1));
            return 1 - Math.pow((unseen - 3.0) / unseen, toReveal);
        }

        double p1 = chanceOfPair(flipped);
        double p2 = chanceOfThreeOfKind(flipped);
        return p1 * p2;
    }

    public double chanceOfStraightFlush(List<Card> flipped) {
        /*
         * Calculates the probability of getting a straight flush
         */
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
        int unseen = 52 - all.size() - (2 * (numPlayers - 1));
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

