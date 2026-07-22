package com.adelyss.events.controller;

import com.adelyss.events.dto.AdminQuoteReplyRequest;
import com.adelyss.events.dto.AdminQuoteResponse;
import com.adelyss.events.model.AdminUser;
import com.adelyss.events.service.AdminQuoteService;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/quotes")
public class AdminQuoteController {
  private static final String ADMIN_USER_ATTR = "adminUser";
  private final AdminQuoteService adminQuoteService;

  public AdminQuoteController(AdminQuoteService adminQuoteService) {
    this.adminQuoteService = adminQuoteService;
  }

  @GetMapping
  public ResponseEntity<List<AdminQuoteResponse>> listQuotes() {
    return ResponseEntity.ok(adminQuoteService.listQuotes());
  }

  @GetMapping("/{id}")
  public ResponseEntity<AdminQuoteResponse> getQuote(@PathVariable Long id) {
    return ResponseEntity.ok(adminQuoteService.getQuote(id));
  }

  @PostMapping("/{id}/reply")
  public ResponseEntity<AdminQuoteResponse> replyToQuote(
      @PathVariable Long id,
      @Valid @RequestBody AdminQuoteReplyRequest request,
      HttpServletRequest servletRequest) {
    AdminUser adminUser = (AdminUser) servletRequest.getAttribute(ADMIN_USER_ATTR);
    return ResponseEntity.ok(
        adminQuoteService.replyToQuote(
            id, request.getSubject(), request.getMessage(), request.getStatus(), adminUser));
  }
}
