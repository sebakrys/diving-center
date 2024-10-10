package pl.sebakrys.diving.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable()) // Wyłączenie CSRF
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/event/**").permitAll()
                        .requestMatchers("/roles/**").permitAll()
                        .requestMatchers("/users/**").permitAll()
                        .requestMatchers("/event-registration/**").permitAll()
                        .anyRequest().authenticated() // Wymaga autoryzacji dla innych zapytań
                );

        return http.build();
    }
}
