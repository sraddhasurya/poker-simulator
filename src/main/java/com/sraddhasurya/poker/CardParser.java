package com.sraddhasurya.poker;
import java.util.*;

public class CardParser {

    public static Card parse(String code) {
        /*
         * Takes the input of the cards given in format Rank Suit (e.x. AH -- Ace of Hearts) and converts them into a proper card
         */
        if (code.length() < 2 || code.length() > 3)
            throw new IllegalArgumentException("Invalid card code: " + code);

        String rankStr = code.substring(0, code.length() - 1);
        String suitChar = code.substring(code.length() - 1).toUpperCase();

        int rank = switch (rankStr.toUpperCase()) {
            case "J" -> 11;
            case "Q" -> 12;
            case "K" -> 13;
            case "A" -> 14;
            default -> Integer.parseInt(rankStr);
        };

        String suit = switch (suitChar) {
            case "H" -> "hearts";
            case "D" -> "diamonds";
            case "C" -> "clubs";
            case "S" -> "spades";
            default -> throw new IllegalArgumentException("Unknown suit: " + suitChar);
        };

        return new Card(suit, rank);
    }

    public static List<Card> parseList(List<String> codes) {
        /*
         * Converts all of the inputs given into a list of cards
         */
        List<Card> result = new ArrayList<>();
        for (String code : codes) {
            result.add(parse(code));
        }
        return result;
    }
}

