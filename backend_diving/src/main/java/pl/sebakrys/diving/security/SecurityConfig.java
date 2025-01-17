package pl.sebakrys.diving.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import static pl.sebakrys.diving.blog.service.BlogService.BLOG_IMAGES_ACCES_DIRECTORY;
import static pl.sebakrys.diving.page_content.service.FilesService.IMAGES_ACCES_DIRECTORY;
import static pl.sebakrys.diving.page_content.service.FilesService.PAGES_ACCES_DIRECTORY;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private UserSecurityService userSecurityService; // Upewnij się, że jest poprawnie zaimplementowany

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfig = new CorsConfiguration();
                    corsConfig.addAllowedOrigin("http://localhost:3000");
                    corsConfig.addAllowedOrigin("https://frontend-diving1-66787313904.europe-west4.run.app");
                    corsConfig.addAllowedMethod("*");
                    corsConfig.addAllowedHeader("*");
                    return corsConfig;
                }))
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp
                                .policyDirectives("frame-ancestors 'self' http://localhost:3000 http://localhost:8080 https://frontend-diving1-66787313904.europe-west4.run.app")
                        )
                )
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/authenticate", "/refresh-token", "/users/", "/event/{month}/{year}").permitAll()
                        .requestMatchers("/users/activate", "/users/password-reset/request", "/users/password-reset").permitAll()
                        .requestMatchers(BLOG_IMAGES_ACCES_DIRECTORY+"*").permitAll()
                        .requestMatchers(IMAGES_ACCES_DIRECTORY+"**").permitAll()
                        .requestMatchers(PAGES_ACCES_DIRECTORY+"**").permitAll()
                        .requestMatchers("/video/**").permitAll()//TODO zmienić później - do usuniecia
                        .requestMatchers("/courses/**", "/materials/**").permitAll()
                        .requestMatchers("/course_materials/**").permitAll()
                        .requestMatchers("/blog/post").permitAll()
                        //.requestMatchers("/sendMail").permitAll()// usunać, tylko do testu
                        .requestMatchers("/roles/").hasAnyRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userSecurityService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
