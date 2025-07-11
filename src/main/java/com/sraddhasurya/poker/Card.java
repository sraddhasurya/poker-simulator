package com.sraddhasurya.poker;

/*
 * Defines a playing card with a suit and numerical value
 */

public class Card {
    private final String suit;
    private final int number;

    public Card(String suit, int number) {
        /**
         * Constructs a Card with the specificed suit and number
         */
        this.suit = suit.toLowerCase();
        this.number = number;
    }

    public String getSuit() {
        return suit;
    }

    public int getNumber() {
        return number;
    }

    public boolean isPair(Card other) {
        /**
         * Checks if this card forms a pair with another card (same number)
         * 
         * @param other: the other card to compare with
         * @return true if both cards have the same number
         */
        return this.number == other.number;
    }

    public boolean isEqual(Card other) {
        /**
         * Checks if this card is exactly equal to another card (same number and suit)
         * 
         * @param other: other card to compare
         * @return true if bpth cards have the same suit and number 
         */
        return this.number == other.number && this.suit.equals(other.suit);
    }

    @Override
    public String toString() {
        return number + " of " + suit;
    }
}
