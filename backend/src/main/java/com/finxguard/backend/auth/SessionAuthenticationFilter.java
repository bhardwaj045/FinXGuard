
package com.finxguard.backend.auth;

import java.io.IOException;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.server.ResponseStatusException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {

    public static final String TOKEN_ATTRIBUTE =
            SessionAuthenticationFilter.class.getName() + ".token";

    private final AuthService authService;
    private final SupabaseTokenVerifier tokenVerifier;

    public SessionAuthenticationFilter(
            AuthService authService,
            SupabaseTokenVerifier tokenVerifier) {
        this.authService = authService;
        this.tokenVerifier = tokenVerifier;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("OPTIONS".equalsIgnoreCase(method)
                || isPublicEndpoint(path, method)) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = bearerToken(
                request.getHeader("Authorization"));

        if (token == null || token.isBlank()) {
            response.sendError(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Authentication required");
            return;
        }

        SupabaseTokenVerifier.SupabaseUser supabaseUser;
        try {
            supabaseUser = tokenVerifier.verify(token);
        } catch (ResponseStatusException ex) {
            response.sendError(
                    ex.getStatusCode().value(),
                    ex.getReason());
            return;
        } catch (Exception ex) {
            response.sendError(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Invalid or expired Supabase session.");
            return;
        }

        Optional<AuthenticatedUser> user =
                authService.findUserBySupabaseId(supabaseUser.id());

        if (user.isEmpty()) {
            try {
                user = Optional.of(authService.synchronizeSupabaseProfile(supabaseUser, null));
            } catch (Exception ex) {
                response.sendError(
                        HttpStatus.UNAUTHORIZED.value(),
                        "User profile synchronization failed.");
                return;
            }
        }

        AuthenticatedUser principal = user.get();

        String roleRequired = requiredRole(path, method);

        if ("FORBIDDEN".equals(roleRequired)
                || (roleRequired != null
                && !roleRequired.equals(principal.role()))) {

            response.sendError(
                    HttpStatus.FORBIDDEN.value(),
                    "Access denied");
            return;
        }

        request.setAttribute(
                AuthContext.REQUEST_ATTRIBUTE,
                principal);

        request.setAttribute(TOKEN_ATTRIBUTE, token);

        filterChain.doFilter(request, response);
    }

    private static boolean isPublicEndpoint(
            String path,
            String method) {

        if (!"POST".equalsIgnoreCase(method)) {
            return false;
        }

        return path.equals("/api/auth/profile/sync")
                || path.equals("/api/auth/logout");
    }

    private static String requiredRole(
            String path,
            String method) {

        if (path.startsWith("/api/admin/")
                || path.startsWith("/api/analytics/")
                || path.startsWith("/api/config/")
                || "/api/config".equals(path)
                || path.startsWith("/api/feedback/")
                || "/api/feedback".equals(path)) {
            return "ADMIN";
        }

        if (path.equals("/api/alerts/my")
                || path.startsWith("/api/alerts/my/")) {
            return "USER";
        }

        if (path.startsWith("/api/transactions/")) {

            if (path.equals("/api/transactions/my")
                    || path.startsWith("/api/transactions/my/")) {
                return "USER";
            }

            if (path.matches("/api/transactions/[^/]+")
                    && "GET".equalsIgnoreCase(method)) {
                return null;
            }

            return "ADMIN";
        }

        if ("/api/transactions".equals(path)) {
            return "FORBIDDEN";
        }

        return null;
    }

    private static String bearerToken(String header) {

        if (header == null
                || !header.startsWith("Bearer ")) {
            return null;
        }

        return header.substring(7).trim();
    }
}
