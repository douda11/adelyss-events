package com.adelyss.events.config;

import com.adelyss.events.model.AdminUser;
import com.adelyss.events.repository.AdminUserRepository;
import com.adelyss.events.service.AdminAuthService;
import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapConfig {
  private final AdminUserRepository adminUserRepository;
  private final AdminAuthService adminAuthService;

  @Value("${app.admin.bootstrap.email:admin@adelyss.com}")
  private String bootstrapEmail;

  @Value("${app.admin.bootstrap.password:Admin123!}")
  private String bootstrapPassword;

  @Value("${app.admin.bootstrap.full-name:Adelyss Admin}")
  private String bootstrapFullName;

  public AdminBootstrapConfig(
      AdminUserRepository adminUserRepository, AdminAuthService adminAuthService) {
    this.adminUserRepository = adminUserRepository;
    this.adminAuthService = adminAuthService;
  }

  @PostConstruct
  public void ensureAdminExists() {
    if (adminUserRepository.findByEmail(bootstrapEmail.toLowerCase().trim()).isPresent()) {
      return;
    }

    AdminUser adminUser = new AdminUser();
    adminUser.setEmail(bootstrapEmail.toLowerCase().trim());
    adminUser.setFullName(bootstrapFullName);
    adminUser.setRole("ADMIN");
    adminUser.setActive(true);
    adminUser.setPasswordHash(adminAuthService.hashPassword(bootstrapPassword));
    adminUserRepository.save(adminUser);
  }
}
