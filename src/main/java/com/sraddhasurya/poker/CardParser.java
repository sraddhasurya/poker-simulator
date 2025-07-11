package com.sraddhasurya.poker;
import java.util.*;

public class CardParser {
    /**
     * Utility class for converting the shorthand card codes into Card objects 
     */

 
    public static Card parse(String code) {
        /**
         * Converts a single card code into a Card object
         * 
         * @param code: a string representing the card (e.x. "AH")
         * @return the converted Card object
         * @throws IllegalArguemnetException if the input is invalid or unrecognized
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
         * Converts all of the inputs given into a list of Card objects
         * 
         * @param codes: list of card codes
         * @return result: a list of corresponding Card objects 
         */
        List<Card> result = new ArrayList<>();
        for (String code : codes) {
            result.add(parse(code));
        }
        return result;
    }
}

