package com.adelyss.events.controller;

import com.adelyss.events.dto.QuoteRequest;
import com.adelyss.events.dto.QuoteResponse;
import com.adelyss.events.model.Quote;
import com.adelyss.events.service.QuoteService;
import javax.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class QuoteController {
  private final QuoteService quoteService;

  public QuoteController(QuoteService quoteService) {
    this.quoteService = quoteService;
  }

  @PostMapping("/quotes")
  public ResponseEntity<QuoteResponse> createQuote(@Valid @RequestBody QuoteRequest request) {
    Quote savedQuote = quoteService.createQuote(request);

    QuoteResponse response = new QuoteResponse();
    response.setId(savedQuote.getId());
    response.setStatus("created");
    response.setMessage("Quote request received");
    response.setFullName(savedQuote.getFullName());
    response.setEmail(savedQuote.getEmail());
    response.setCreatedAt(savedQuote.getCreatedAt());

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }
}
