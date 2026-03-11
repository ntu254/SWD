package com.example.backendservice.common.constants;

public final class AppConstants {

    private AppConstants() {
        throw new IllegalStateException("Constants class");
    }

    // API Paths
    public static final String API_PREFIX = "/api";
    public static final String API_V1 = API_PREFIX + "/v1";

    // Pagination
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 100;
    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    // JWT
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";

    // Roles
    public static final String ROLE_USER = "ROLE_USER";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_ENTERPRISE = "ROLE_ENTERPRISE";
    public static final String ROLE_COLLECTOR = "ROLE_COLLECTOR";
}
