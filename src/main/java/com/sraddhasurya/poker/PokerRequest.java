package com.sraddhasurya.poker;

import java.util.List;

public class PokerRequest {
    private List<String> holeCards;
    private List<String> communityCards;
    private int potSize;
    private int callAmount;

    public List<String> getHoleCards() {
        return holeCards;
    }

    public void setHoleCards(List<String> holeCards) {
        this.holeCards = holeCards;
    }
    public void setPotSize(int potSize){
        this.potSize=potSize;
    }

    public List<String> getCommunityCards() {
        return communityCards;
    }

    public void setCommunityCards(List<String> communityCards) {
        this.communityCards = communityCards;
    }

    public int getPotSize(){
        return potSize;
    }
    public int getCallAmount(){
        return callAmount;
    }
    public void setCallAmount(int callAmount){
        this.callAmount=callAmount;
    }
    
}

