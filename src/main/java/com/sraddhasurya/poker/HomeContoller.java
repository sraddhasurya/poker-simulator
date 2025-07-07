package com.sraddhasurya.poker;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Controller
public class HomeContoller {

    // Serves index.html from src/main/resources/static
    @GetMapping("/")
    public String index() {
        return "index.html";
    }

    // Proxy to Python simulation if still needed
    @GetMapping("/simulate")
    public ResponseEntity<Map<String, Object>> simulate(@RequestParam(defaultValue = "100000") int trials) {
        String url = "http://localhost:8001/simulate?trials=" + trials;
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        return ResponseEntity.ok(response.getBody());
    }
}
