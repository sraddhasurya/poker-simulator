package com.sraddhasurya.poker;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Spring configuration class from enabling cross origin resource sharing 
 * Allows React frontend to make HTTP requests to this backend 
 */
@Configuration      //Allows the frontend to request us
public class WebConfig {
    /**
     * Defines a CORS configuration bean that allows requests from React frontend 
     * Automatically runs on application startup
     */
    @Bean       
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@NonNull CorsRegistry registry) {
                registry.addMapping("/api/**")                  // Applies to all endpoints under /api/
                        .allowedOrigins("http://localhost:3000") // React runs here
                        .allowedMethods("GET", "POST");          // Only allows GET and POST requests 
            }
        };
    }
}
