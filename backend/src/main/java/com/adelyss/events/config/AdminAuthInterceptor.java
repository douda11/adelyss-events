package com.adelyss.events.config;

import com.adelyss.events.model.AdminUser;
import com.adelyss.events.service.AdminAuthService;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.server.ResponseStatusException;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {
  private final AdminAuthService adminAuthService;

  public AdminAuthInterceptor(AdminAuthService adminAuthService) {
    this.adminAuthService = adminAuthService;
  }

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
      throws Exception {
    String path = request.getRequestURI();
    if ("/api/admin/auth/login".equals(path)) {
      return true;
    }

    String authorization = request.getHeader("Authorization");
    if (authorization == null || !authorization.startsWith("Bearer ")) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authorization Bearer requis");
    }

    String token = authorization.substring("Bearer ".length());
    AdminUser adminUser = adminAuthService.authenticate(token);
    request.setAttribute("adminUser", adminUser);
    return true;
  }
}
