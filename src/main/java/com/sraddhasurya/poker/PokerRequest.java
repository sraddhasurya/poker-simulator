package com.sraddhasurya.poker;

import java.util.List;

public class PokerRequest {
    private List<String> holeCards;
    private List<String> communityCards;

    public List<String> getHoleCards() {
        return holeCards;
    }

    public void setHoleCards(List<String> holeCards) {
        this.holeCards = holeCards;
    }

    public List<String> getCommunityCards() {
        return communityCards;
    }

    public void setCommunityCards(List<String> communityCards) {
        this.communityCards = communityCards;
    }
}

