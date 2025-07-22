package com.sraddhasurya.poker;

import java.util.List;

public class WinnerRequest {
    private List<List<String>> players;
    private List<String> community;

    public List<List<String>> getPlayers() {
        return players;
    }
    public void setPlayers(List<List<String>> players) {
        this.players = players;
    }
    public List<String> getCommunity() {
        return community;
    }
    public void setCommunity(List<String> community) {
        this.community = community;
    }
}

