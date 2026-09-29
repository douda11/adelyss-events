package com.adelyss.events.controller;

import com.adelyss.events.model.*;
import com.adelyss.events.repository.*;
import com.adelyss.events.service.EmailService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PublicApiController {

  private final EventRepository eventRepository;
  private final TeamMemberRepository teamMemberRepository;
  private final JobOfferRepository jobOfferRepository;
  private final PartnerRepository partnerRepository;
  private final JobApplicationRepository jobApplicationRepository;
  private final ContactMessageRepository contactMessageRepository;
  private final ServiceOfferRepository serviceOfferRepository;
  private final EmailService emailService;

  private final Path cvUploadDir = Paths.get("uploads/cvs");

  public PublicApiController(
      EventRepository eventRepository,
      TeamMemberRepository teamMemberRepository,
      JobOfferRepository jobOfferRepository,
      PartnerRepository partnerRepository,
      JobApplicationRepository jobApplicationRepository,
      ContactMessageRepository contactMessageRepository,
      ServiceOfferRepository serviceOfferRepository,
      EmailService emailService) throws IOException {
    this.eventRepository = eventRepository;
    this.teamMemberRepository = teamMemberRepository;
    this.jobOfferRepository = jobOfferRepository;
    this.partnerRepository = partnerRepository;
    this.jobApplicationRepository = jobApplicationRepository;
    this.contactMessageRepository = contactMessageRepository;
    this.serviceOfferRepository = serviceOfferRepository;
    this.emailService = emailService;
    
    if (!Files.exists(cvUploadDir)) {
      Files.createDirectories(cvUploadDir);
    }
  }

  @GetMapping("/public/events")
  public List<Event> getPublicEvents() {
    return eventRepository.findAll();
  }

  @GetMapping("/public/team")
  public List<TeamMember> getPublicTeam() {
    return teamMemberRepository.findAll();
  }

  @GetMapping("/public/job-offers")
  public List<JobOffer> getPublicJobOffers() {
    return jobOfferRepository.findByActiveTrue();
  }

  @GetMapping("/public/partners")
  public List<Partner> getPublicPartners() {
    return partnerRepository.findAll();
  }

  @GetMapping("/public/services")
  public List<ServiceOffer> getPublicServices() {
    return serviceOfferRepository.findByActiveTrueOrderByDisplayOrderAsc();
  }

  @PostMapping("/recruitment/applications")
  public ResponseEntity<JobApplication> submitApplication(
      @RequestParam("fullName") String fullName,
      @RequestParam("email") String email,
      @RequestParam("phone") String phone,
      @RequestParam("position") String position,
      @RequestParam("motivation") String motivation,
      @RequestParam("cv") MultipartFile cvFile) {

    if (cvFile.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CV file is required");
    }

    try {
      String originalFilename = cvFile.getOriginalFilename();
      String extension = "";
      if (originalFilename != null && originalFilename.contains(".")) {
        extension = originalFilename.substring(originalFilename.lastIndexOf("."));
      }
      String uniqueFilename = UUID.randomUUID().toString() + extension;
      Path filePath = cvUploadDir.resolve(uniqueFilename);
      Files.copy(cvFile.getInputStream(), filePath);

      JobApplication application = new JobApplication();
      application.setFullName(fullName);
      application.setEmail(email);
      application.setPhone(phone);
      application.setPosition(position);
      application.setMotivation(motivation);
      application.setCvUrl("/uploads/cvs/" + uniqueFilename);

      JobApplication saved = jobApplicationRepository.save(application);

      // 1. Accusé de réception automatique au candidat
      String candidateSubject = "Confirmation de réception de votre candidature — Adelyss Events";
      String candidateBody = "Madame, Monsieur bonjour,\n\n" +
          "Nous confirmons la bonne réception de votre candidature pour le poste de : " + saved.getPosition() + ".\n\n" +
          "Notre équipe étudie votre profil avec soin et vous recontactera si votre candidature correspond à nos attentes.\n\n" +
          "Nous vous remercions de votre intérêt pour Adelyss Events.\n\n" +
          "L'équipe Recrutement Adelyss Events";
      try {
        emailService.send(saved.getEmail(), candidateSubject, candidateBody);
      } catch (Exception e) {
        System.err.println("Failed to send candidate confirmation: " + e.getMessage());
      }

      // 2. Alerte immédiate envoyée à la boîte mail contact@adelyss-events.com
      String adminSubject = "📥 Nouvelle candidature reçue : " + saved.getFullName() + " (" + saved.getPosition() + ")";
      String adminBody = "Bonjour,\n\n" +
          "Une nouvelle candidature a été soumise sur votre site internet :\n\n" +
          "• Candidat : " + saved.getFullName() + "\n" +
          "• Email : " + saved.getEmail() + "\n" +
          "• Téléphone : " + (saved.getPhone() != null && !saved.getPhone().trim().isEmpty() ? saved.getPhone() : "Non renseigné") + "\n" +
          "• Poste visé : " + saved.getPosition() + "\n\n" +
          "• Motivation / Message :\n" + (saved.getMotivation() != null ? saved.getMotivation() : "Non renseignée") + "\n\n" +
          "• Fichier CV enregistré : " + uniqueFilename + "\n\n" +
          "--------------------------------------------------\n" +
          "Consultez et téléchargez ce CV sur votre espace admin : https://visionary-kheer-6d169b.netlify.app/admin/recruitment/applications";
      try {
        emailService.send("contact@adelyss-events.com", adminSubject, adminBody);
      } catch (Exception e) {
        System.err.println("Failed to send admin application notification: " + e.getMessage());
      }

      return ResponseEntity.ok(saved);

    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store CV", e);
    }
  }

  @PostMapping("/public/contact")
  public ResponseEntity<ContactMessage> submitContact(@RequestBody ContactMessage contactMessage) {
    ContactMessage saved = contactMessageRepository.save(contactMessage);
    
    // 1. Accusé de réception automatique au visiteur
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

    // 2. Alerte immédiate envoyée à la boîte mail contact@adelyss-events.com
    String adminSubject = "💬 Nouveau message de contact : " + saved.getName();
    String adminBody = "Bonjour,\n\n" +
        "Un nouveau message de contact a été reçu sur le site :\n\n" +
        "• Nom & Prénom : " + saved.getName() + "\n" +
        "• Email : " + saved.getEmail() + "\n" +
        "• Téléphone : " + (saved.getPhone() != null && !saved.getPhone().trim().isEmpty() ? saved.getPhone() : "Non renseigné") + "\n\n" +
        "• Message du visiteur :\n" + saved.getMessage() + "\n\n" +
        "--------------------------------------------------\n" +
        "Vous pouvez répondre directement depuis votre espace admin : https://visionary-kheer-6d169b.netlify.app/admin/messages";
    try {
      emailService.send("contact@adelyss-events.com", adminSubject, adminBody);
    } catch (Exception e) {
      System.err.println("Failed to send admin contact notification: " + e.getMessage());
    }
    
    return ResponseEntity.ok(saved);
  }
}
