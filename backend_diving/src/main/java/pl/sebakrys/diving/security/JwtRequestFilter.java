package pl.sebakrys.diving.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import pl.sebakrys.diving.course.entity.Course;
import pl.sebakrys.diving.course.entity.CourseMaterial;
import pl.sebakrys.diving.course.service.CourseMaterialService;
import pl.sebakrys.diving.users.entity.User;
import pl.sebakrys.diving.users.repo.UserRepo;
import pl.sebakrys.diving.users.service.UserService;

import java.io.IOException;
import java.util.Optional;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {


    private UserSecurityService userSecurityService;


    private JwtUtil jwtUtil;


    private FileAccessService fileAccessService;  // Serwis do sprawdzania dostępu do plików

    @Autowired
    public JwtRequestFilter(UserSecurityService userSecurityService, JwtUtil jwtUtil, FileAccessService fileAccessService) {
        this.userSecurityService = userSecurityService;
        this.jwtUtil = jwtUtil;
        this.fileAccessService = fileAccessService;
    }


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String userUuid = null;
        String jwt = null;
        // Pobieranie ścieżki URI
        String requestURI = request.getRequestURI();

        // Pobierz token z nagłówka
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            userUuid = jwtUtil.extractSubject(jwt);
        }


        // 1. Sprawdzanie dostępu do plików video
        if (requestURI.startsWith("/course_materials/")) {
            System.err.println("/course_materials/");
            System.err.println("requestURI: "+ requestURI);

            if(requestURI.startsWith("/course_materials/videos/")){// pliki video hls
                System.err.println("VIDEO");
                if (jwt != null && fileAccessService.hasAccessToVideoFile(request)) {
                    // Użytkownik ma dostęp do pliku
                    chain.doFilter(request, response);
                } else {
                    // Użytkownik nie ma dostępu do pliku
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "You do not have access to this file.");
                }
            }else{//pozostałe pliki
                System.err.println("POZOSTALE");
                if (jwt != null && fileAccessService.hasAccessToFile(request)) {
                    // Użytkownik ma dostęp do pliku
                    chain.doFilter(request, response);
                } else {
                    // Użytkownik nie ma dostępu do pliku
                    response.sendError(HttpServletResponse.SC_FORBIDDEN, "You do not have access to this file.");
                }
            }

        } else {

            // Walidacja tokenu
            if (userUuid  != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userSecurityService.loadUserByUuid(userUuid);

                if (jwtUtil.validateToken(jwt, userDetails)) {

                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());

                    usernamePasswordAuthenticationToken
                            .setDetails(new WebAuthenticationDetailsSource()
                                    .buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                }
            }
            chain.doFilter(request, response);
        }
    }
}
