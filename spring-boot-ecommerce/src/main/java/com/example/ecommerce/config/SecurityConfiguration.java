package com.example.ecommerce.config;

import com.okta.spring.boot.oauth.Okta;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.accept.ContentNegotiationStrategy;
import org.springframework.web.accept.HeaderContentNegotiationStrategy;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfiguration {

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(configurer ->
            configurer
                .requestMatchers("/api/orders/**")
                .authenticated()
                .anyRequest().permitAll()
        )
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(Customizer.withDefaults())
        );
    http.cors(Customizer.withDefaults());
    // Remove or comment out the next line:
//    http.setSharedObject(ContentNegotiationStrategy.class, new HeaderContentNegotiationStrategy());
    Okta.configureResourceServer401ResponseBody(http);
    http.csrf(AbstractHttpConfigurer::disable);
    return http.build();
  }

//  @Bean
//  public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
//    org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
//    configuration.setAllowedOrigins(java.util.List.of("http://localhost:4200"));
//    configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//    configuration.setAllowedHeaders(java.util.List.of("*"));
//    configuration.setAllowCredentials(true);
//    org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
//    source.registerCorsConfiguration("/**", configuration);
//    return source;
//  }
}