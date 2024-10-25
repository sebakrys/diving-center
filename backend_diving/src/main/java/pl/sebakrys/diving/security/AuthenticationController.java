package pl.sebakrys.diving.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.UserRepo;

import java.util.HashMap;
import java.util.Map;


@RestController
public class AuthenticationController {

    @Autowired
    UserRepo userRepo;
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserSecurityService userSecurityService;


    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshAuthenticationToken(HttpServletRequest request) {
        System.out.println("refreshAuthenticationToken");
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String oldToken = authHeader.substring(7);
            try {
                // Wyodrębnij nazwę użytkownika z tokena
                String username = jwtUtil.extractUsername(oldToken);
                // Załaduj UserDetails na podstawie nazwy użytkownika
                UserDetails userDetails = userSecurityService.loadUserByUsername(username);

                // Walidacja tokena
                if (jwtUtil.validateToken(oldToken, userDetails)) {
                    User user = userRepo.findByEmail(username).orElseThrow();

                    // Generowanie nowego tokena
                    String newJwt = jwtUtil.generateToken(user);

                    Map<String, Object> response = new HashMap<>();
                    response.put("jwt", newJwt);
                    response.put("roles", user.getRoles());//TODO  trzymanie ról w tokenie to nie jest dobry pomysł, może zamienić na pobieranie
//TODO wysyłasz token JWT i w odpowiedzi dostajesz role jakie user posiada
                    return ResponseEntity.ok(response);
                } else {
                    return ResponseEntity.status(401).body("Nieprawidłowy lub wygasły token");
                }
            } catch (Exception e) {
                return ResponseEntity.status(401).body("Nieprawidłowy token");
            }
        } else {
            return ResponseEntity.status(400).body("Brak nagłówka Authorization");
        }
    }


    @PostMapping("/authenticate")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationRequest authenticationRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authenticationRequest.getEmail(),
                            authenticationRequest.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Nieprawidłowe dane uwierzytelniające");
        }

        final UserDetails userDetails = userSecurityService.loadUserByUsername(authenticationRequest.getEmail());
        final User user = userRepo.findByEmail(authenticationRequest.getEmail()).orElseThrow();
        final String jwt = jwtUtil.generateToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("jwt", jwt);
        response.put("roles", user.getRoles());

        return ResponseEntity.ok(response);
    }

}
