package com.sraddhasurya.poker;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController

@RequestMapping("/api/poker")
public class PokerController {


    @GetMapping("/test")
    public ResponseEntity<Map<String, Double>> test() {
        List<Card> hole = List.of(CardParser.parse("AH"), CardParser.parse("KD"));
        List<Card> board = List.of(CardParser.parse("10H"), CardParser.parse("JH"), CardParser.parse("QH"));

        HandProbabilities probs = new HandProbabilities(hole);
        Map<String, Double> result = new LinkedHashMap<>();
        result.put("Pair", probs.chanceOfPair(board));
        result.put("Two Pair", probs.chanceOfTwoPair(board));
        result.put("Three of a Kind", probs.chanceOfThreeOfKind(board));
        result.put("Straight", probs.chanceOfStraight(board));
        result.put("Flush", probs.chanceOfFlush(board));
        result.put("Full House", probs.chanceOfFullHouse(board));
        result.put("Four of a Kind", probs.chanceOfFourOfKind(board));
        result.put("Straight Flush", probs.chanceOfStraightFlush(board));

        return ResponseEntity.ok(result);
}
    
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/probabilities")
    public ResponseEntity<Map<String, Object>> calculateProbabilities(@RequestBody PokerRequest request) {
        try {
            List<Card> holeCards = CardParser.parseList(request.getHoleCards());
            List<Card> communityCards = CardParser.parseList(request.getCommunityCards());
    
            // Only calculate if we have 2 hole cards and at least 3 community cards
            if (holeCards.size() != 2 || communityCards.size() < 3) {
                return ResponseEntity.ok(Map.of(
                    "probabilities", null,
                    "expectedValue", null
                ));
            }
    
            HandProbabilities probs = new HandProbabilities(holeCards);
            Map<String, Double> result = new LinkedHashMap<>();
            result.put("Pair", probs.chanceOfPair(communityCards));
            result.put("Two Pair", probs.chanceOfTwoPair(communityCards));
            result.put("Three of a Kind", probs.chanceOfThreeOfKind(communityCards));
            result.put("Straight", probs.chanceOfStraight(communityCards));
            result.put("Flush", probs.chanceOfFlush(communityCards));
            result.put("Full House", probs.chanceOfFullHouse(communityCards));
            result.put("Four of a Kind", probs.chanceOfFourOfKind(communityCards));
            result.put("Straight Flush", probs.chanceOfStraightFlush(communityCards));
    
            double ev = PokerEVSimulator.simulateEV(holeCards, communityCards, request.getPotSize(), request.getCallAmount(), 10000);
    
            return ResponseEntity.ok(Map.of(
                "probabilities", result,
                "expectedValue", ev
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid input"));
        }
    }
    
}

