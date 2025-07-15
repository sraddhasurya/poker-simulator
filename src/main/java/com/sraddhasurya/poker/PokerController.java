package com.sraddhasurya.poker;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;


/**
 * Controller for handling API requests for poker probability calculations
 * Exposes endpoints that allow the frontend to request poker hand probabilities and expected values 
 */
@RestController     // Indicates this class handles HTTP requests and returns JSON responses
@RequestMapping("/api/poker")   //Base path for all URLs in this controller 
public class PokerController {

    /**
     * Test endpoint for verifying backend logic with hardcoded cards
     * @return JSON map of poker hand probabilities 
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Double>> test() {
        
        List<Card> hole = List.of(CardParser.parse("AH"), CardParser.parse("KD"));
        List<Card> board = List.of(CardParser.parse("10H"), CardParser.parse("JH"), CardParser.parse("QH"));
        int numPlayers=2;

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

        return ResponseEntity.ok(result);       // Sends back to who made the request 
}
    
    /**
    * Endpoiunt for calculating poker hand probabilities and expected value
    * @param request a JSON body containing hole cards, community cards, pot size, and call size
    * @return JSON response with probabilities and EV or an error if input is invalid 
    */
    @CrossOrigin(origins = "http://localhost:3000")     //Allows React frontend to send requests to backend
    @PostMapping("/probabilities")
    public ResponseEntity<Map<String, Object>> calculateProbabilities(@RequestBody PokerRequest request) {
        try {
            List<Card> holeCards = CardParser.parseList(request.getHoleCards());
            List<Card> communityCards = CardParser.parseList(request.getCommunityCards());
            int numPlayers = request.getNumPlayers();
    
            // Only calculate if we have 2 hole cards 
            if (holeCards.size() < 2) {
                return ResponseEntity.ok(Map.of(
                    "probabilities", null,
                    "expectedValue", null
                ));
            }

    
            HandProbabilities probs = new HandProbabilities(holeCards);
            Map<String, Double> resultMap = new LinkedHashMap<>();
            resultMap.put("Pair", probs.chanceOfPair(communityCards));
            resultMap.put("Two Pair", probs.chanceOfTwoPair(communityCards));
            resultMap.put("Three of a Kind", probs.chanceOfThreeOfKind(communityCards));
            resultMap.put("Straight", probs.chanceOfStraight(communityCards));
            resultMap.put("Flush", probs.chanceOfFlush(communityCards));
            resultMap.put("Full House", probs.chanceOfFullHouse(communityCards));
            resultMap.put("Four of a Kind", probs.chanceOfFourOfKind(communityCards));
            resultMap.put("Straight Flush", probs.chanceOfStraightFlush(communityCards));
    
            //Runs simulation for expect value based on current board
            PokerEVResult result = PokerEVSimulator.simulateEV(holeCards, communityCards, request.getPotSize(), request.getCallAmount(), 10000, request.getNumPlayers());   
    
            return ResponseEntity.ok(Map.of(
                "probabilities", resultMap,
                "expectedValue", result.getExpectedValue(),
                "winProbability", result.getWinProbability(),
                "tieProbability", result.getTieProbability()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid input"));  
        }
    }
    
}

