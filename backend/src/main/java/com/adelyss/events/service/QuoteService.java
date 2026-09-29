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
    
    // 1. Accusé de réception automatique au client
    String clientSubject = "Merci pour votre message !";
    String clientBody = "Madame, Monsieur bonjour,\n\n" +
                  "Merci de nous avoir contactés.\n\n" +
                  "Nous confirmons la bonne réception de votre message.\n\n" +
                  "Un membre de notre équipe vous répondra dans les meilleurs délais.\n\n" +
                  "Nous vous remercions de votre confiance et vous souhaitons une excellente journée.\n\n" +
                  "L'équipe Adelyss Events";
    try {
      emailService.send(saved.getEmail(), clientSubject, clientBody);
    } catch (Exception e) {
      System.err.println("Failed to send auto-reply to client: " + e.getMessage());
    }

    // 2. Alerte immédiate envoyée à la boîte mail contact@adelyss-events.com
    String adminSubject = "🔔 Nouvelle demande de devis : " + saved.getFullName();
    String adminBody = "Bonjour,\n\n" +
        "Une nouvelle demande de devis vient d'être reçue sur le site :\n\n" +
        "• Nom & Prénom : " + saved.getFullName() + "\n" +
        "• Email : " + saved.getEmail() + "\n" +
        "• Téléphone : " + (saved.getPhone() != null && !saved.getPhone().trim().isEmpty() ? saved.getPhone() : "Non renseigné") + "\n" +
        "• Type d'événement : " + (saved.getEventType() != null ? saved.getEventType() : "Non précisé") + "\n" +
        "• Date prévue : " + (saved.getEventDate() != null && !saved.getEventDate().trim().isEmpty() ? saved.getEventDate() : "Non précisée") + "\n" +
        "• Budget estimé : " + (saved.getEstimatedBudget() != null ? saved.getEstimatedBudget() + " TND" : "Non précisé") + "\n\n" +
        "• Détails du besoin :\n" + (saved.getDetails() != null ? saved.getDetails() : "Aucun détail fourni") + "\n\n" +
        "--------------------------------------------------\n" +
        "Retrouvez ce devis dans votre espace admin : https://visionary-kheer-6d169b.netlify.app/admin/quotes";
    try {
      emailService.send("contact@adelyss-events.com", adminSubject, adminBody);
    } catch (Exception e) {
      System.err.println("Failed to send admin quote notification: " + e.getMessage());
    }

    return saved;
  }
}
