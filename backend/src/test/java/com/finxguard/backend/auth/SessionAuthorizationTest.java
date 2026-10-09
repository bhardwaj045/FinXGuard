package com.finxguard.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
class SessionAuthorizationTest {

    @Autowired
    private SessionAuthenticationFilter authenticationFilter;

    @Autowired
    private AuthService authService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private SupabaseTokenVerifier tokenVerifier;

    @BeforeEach
    void clearAccounts() {
        jdbcTemplate.update("DELETE FROM app_users");
    }

    @Test
    void anonymousRequestIsRejectedWithUnauthorized() throws Exception {
        MockHttpServletRequest anonymousRequest =
                new MockHttpServletRequest("GET", "/api/admin/dashboard");
        MockHttpServletResponse anonymousResponse =
                new MockHttpServletResponse();

        authenticationFilter.doFilter(
                anonymousRequest,
                anonymousResponse,
                new MockFilterChain());

        assertEquals(401, anonymousResponse.getStatus());
    }

    @Test
    void unverifiedEmailTokenIsRejectedWithForbidden() throws Exception {
        when(tokenVerifier.verify("unverified-token"))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Please verify your email first."));

        MockHttpServletRequest request =
                new MockHttpServletRequest("GET", "/api/users/me");
        request.addHeader("Authorization", "Bearer unverified-token");
        MockHttpServletResponse response =
                new MockHttpServletResponse();

        authenticationFilter.doFilter(
                request,
                response,
                new MockFilterChain());

        assertEquals(403, response.getStatus());
    }

    @Test
    void adminEndpointsRequireAdminRoleAndRejectUserRole() throws Exception {
        String userToken = "valid-user-supabase-token";
        SupabaseTokenVerifier.SupabaseUser sbUser =
                new SupabaseTokenVerifier.SupabaseUser(
                        "sb-user-id-123",
                        "user@example.com",
                        "Regular User",
                        "USER");

        when(tokenVerifier.verify(userToken)).thenReturn(sbUser);

        // Pre-sync profile to PostgreSQL database
        authService.synchronizeSupabaseProfile(sbUser, "Regular User");

        // A regular user must not access admin endpoints -> 403 Forbidden
        MockHttpServletRequest adminRequest =
                new MockHttpServletRequest("GET", "/api/admin/dashboard");
        adminRequest.addHeader("Authorization", "Bearer " + userToken);
        MockHttpServletResponse adminResponse =
                new MockHttpServletResponse();

        authenticationFilter.doFilter(
                adminRequest,
                adminResponse,
                new MockFilterChain());

        assertEquals(403, adminResponse.getStatus());

        // A regular user can access user endpoints -> 200 OK
        MockHttpServletRequest userRequest =
                new MockHttpServletRequest("GET", "/api/users/me");
        userRequest.addHeader("Authorization", "Bearer " + userToken);
        MockHttpServletResponse userResponse =
                new MockHttpServletResponse();

        authenticationFilter.doFilter(
                userRequest,
                userResponse,
                new MockFilterChain());

        assertEquals(200, userResponse.getStatus());
        assertNotNull(userRequest.getAttribute(AuthContext.REQUEST_ATTRIBUTE));
    }
}
