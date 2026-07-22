package com.adelyss.events.service;

import com.adelyss.events.dto.AdminLoginResponse;
import com.adelyss.events.model.AdminSession;
import com.adelyss.events.model.AdminUser;
import com.adelyss.events.repository.AdminSessionRepository;
import com.adelyss.events.repository.AdminUserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AdminAuthService {
  private static final int SESSION_HOURS = 12;
  private final AdminUserRepository adminUserRepository;
  private final AdminSessionRepository adminSessionRepository;

  public AdminAuthService(
      AdminUserRepository adminUserRepository, AdminSessionRepository adminSessionRepository) {
    this.adminUserRepository = adminUserRepository;
    this.adminSessionRepository = adminSessionRepository;
  }

  public AdminLoginResponse login(String email, String rawPassword) {
    AdminUser adminUser =
        adminUserRepository
            .findByEmail(email.toLowerCase().trim())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides"));

    if (!Boolean.TRUE.equals(adminUser.getActive())
        || !hashPassword(rawPassword).equals(adminUser.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides");
    }

    adminSessionRepository.deleteByExpiresAtBefore(LocalDateTime.now());

    AdminSession session = new AdminSession();
    session.setToken(UUID.randomUUID().toString().replace("-", ""));
    session.setAdminUser(adminUser);
    session.setExpiresAt(LocalDateTime.now().plusHours(SESSION_HOURS));
    session = adminSessionRepository.save(session);

    AdminLoginResponse response = new AdminLoginResponse();
    response.setToken(session.getToken());
    response.setExpiresAt(session.getExpiresAt());
    response.setEmail(adminUser.getEmail());
    response.setFullName(adminUser.getFullName());
    response.setRole(adminUser.getRole());
    return response;
  }

  public AdminUser authenticate(String bearerToken) {
    String token = bearerToken == null ? "" : bearerToken.trim();
    if (token.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token requis");
    }

    AdminSession session =
        adminSessionRepository
            .findByToken(token)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session invalide"));

    if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
      adminSessionRepository.delete(session);
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expirée");
    }

    return session.getAdminUser();
  }

  public String hashPassword(String rawPassword) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
      return Base64.getEncoder().encodeToString(hash);
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException("SHA-256 non disponible", e);
    }
  }
}
