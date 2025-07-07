package com.sraddhasurya.poker;

public class Card {
    private final String suit;
    private final int number;

    public Card(String suit, int number) {
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
        return this.number == other.number;
    }

    public boolean isEqual(Card other) {
        return this.number == other.number && this.suit.equals(other.suit);
    }

    @Override
    public String toString() {
        return number + " of " + suit;
    }
}
