package com.adelyss.events.service;

import com.adelyss.events.dto.AdminQuoteResponse;
import com.adelyss.events.model.AdminUser;
import com.adelyss.events.model.Quote;
import com.adelyss.events.repository.QuoteRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminQuoteService {
  private final QuoteRepository quoteRepository;
  private final EmailService emailService;

  public AdminQuoteService(QuoteRepository quoteRepository, EmailService emailService) {
    this.quoteRepository = quoteRepository;
    this.emailService = emailService;
  }

  public List<AdminQuoteResponse> listQuotes() {
    return quoteRepository.findAllByOrderByCreatedAtDesc().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public AdminQuoteResponse getQuote(Long id) {
    Quote quote =
        quoteRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Devis introuvable"));
    return toResponse(quote);
  }

  public AdminQuoteResponse replyToQuote(
      Long id, String subject, String message, String targetStatus, AdminUser adminUser) {
    Quote quote =
        quoteRepository
            .findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Devis introuvable"));

    emailService.send(quote.getEmail(), subject, message);

    quote.setAdminReplyMessage(message);
    quote.setRepliedAt(LocalDateTime.now());
    quote.setRepliedBy(adminUser.getEmail());
    quote.setStatus(
        targetStatus == null || targetStatus.trim().isEmpty()
            ? "REPLIED"
            : targetStatus.trim().toUpperCase());
    quote = quoteRepository.save(quote);
    return toResponse(quote);
  }

  private AdminQuoteResponse toResponse(Quote quote) {
    AdminQuoteResponse response = new AdminQuoteResponse();
    response.setId(quote.getId());
    response.setFullName(quote.getFullName());
    response.setEmail(quote.getEmail());
    response.setPhone(quote.getPhone());
    response.setEventType(quote.getEventType());
    response.setEventDate(quote.getEventDate());
    response.setEstimatedBudget(quote.getEstimatedBudget());
    response.setDetails(quote.getDetails());
    response.setStatus(quote.getStatus());
    response.setAdminReplyMessage(quote.getAdminReplyMessage());
    response.setRepliedBy(quote.getRepliedBy());
    response.setRepliedAt(quote.getRepliedAt());
    response.setCreatedAt(quote.getCreatedAt());
    return response;
  }
}
