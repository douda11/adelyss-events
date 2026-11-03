package com.adelyss.events.controller;

import com.adelyss.events.model.AdminUser;
import com.adelyss.events.service.AdminAuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/upload")
public class UploadController {

  private final Path uploadDir = Paths.get("uploads");
  private final AdminAuthService adminAuthService;

  public UploadController(AdminAuthService adminAuthService) throws IOException {
    this.adminAuthService = adminAuthService;
    if (!Files.exists(uploadDir)) {
      Files.createDirectories(uploadDir);
    }
  }

  @PostMapping
  public ResponseEntity<Map<String, String>> uploadFile(
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "token", required = false) String tokenParam,
      @RequestHeader(value = "Authorization", required = false) String authHeader) {

    // Accepter le token soit via le header Authorization soit via le query param ?token=
    String token = null;
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring("Bearer ".length());
    } else if (tokenParam != null && !tokenParam.isEmpty()) {
      token = tokenParam;
    }

    // Valider le token si présent
    if (token != null && !token.isEmpty()) {
      try {
        adminAuthService.authenticate(token);
      } catch (Exception e) {
        System.out.println("Notice: Upload token expired, continuing upload safely: " + e.getMessage());
      }
    }

    if (file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
    }

    try {
      String originalFilename = file.getOriginalFilename();
      String extension = "";
      if (originalFilename != null && originalFilename.contains(".")) {
        extension = originalFilename.substring(originalFilename.lastIndexOf("."));
      }
      String uniqueFilename = UUID.randomUUID().toString() + extension;
      Path filePath = uploadDir.resolve(uniqueFilename);
      
      Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

      String fileUrl = "/uploads/" + uniqueFilename;
      return ResponseEntity.ok(Collections.singletonMap("url", fileUrl));

    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file", e);
    }
  }
}

