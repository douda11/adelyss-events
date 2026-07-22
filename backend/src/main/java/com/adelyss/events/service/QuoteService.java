package com.adelyss.events.service;

import com.adelyss.events.dto.QuoteRequest;
import com.adelyss.events.model.Quote;
import com.adelyss.events.repository.QuoteRepository;
import org.springframework.stereotype.Service;

@Service
public class QuoteService {
  private final QuoteRepository quoteRepository;
  private final EmailService emailService;

  public QuoteService(QuoteRepository quoteRepository, EmailService emailService) {
    this.quoteRepository = quoteRepository;
    this.emailService = emailService;
  }

  public Quote createQuote(QuoteRequest request) {
    Quote quote = new Quote();
    quote.setFullName(request.getFullName());
    quote.setEmail(request.getEmail());
    quote.setPhone(request.getPhone());
    quote.setEventType(request.getEventType());
    quote.setEventDate(request.getEventDate());
    quote.setEstimatedBudget(request.getEstimatedBudget());
    quote.setDetails(request.getDetails());
    quote.setStatus("NEW");
    Quote saved = quoteRepository.save(quote);
    
    String subject = "Merci pour votre message !";
    String body = "Madame, Monsieur bonjour,\n\n" +
                  "Merci de nous avoir contactés.\n\n" +
                  "Nous confirmons la bonne réception de votre message.\n\n" +
                  "Un membre de notre équipe vous répondra dans les meilleurs délais.\n\n" +
                  "Nous vous remercions de votre confiance et vous souhaitons une excellente journée.\n\n" +
                  "L'équipe Adelyss Events";
    try {
      emailService.send(saved.getEmail(), subject, body);
    } catch (Exception e) {
      System.err.println("Failed to send auto-reply: " + e.getMessage());
    }
    
    return saved;
  }
}
