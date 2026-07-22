package com.adelyss.events.controller;

import com.adelyss.events.dto.AdminLoginRequest;
import com.adelyss.events.dto.AdminLoginResponse;
import com.adelyss.events.service.AdminAuthService;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {
  private final AdminAuthService adminAuthService;

  public AdminAuthController(AdminAuthService adminAuthService) {
    this.adminAuthService = adminAuthService;
  }

  @PostMapping("/login")
  public ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {
    return ResponseEntity.ok(adminAuthService.login(request.getEmail(), request.getPassword()));
  }
}
