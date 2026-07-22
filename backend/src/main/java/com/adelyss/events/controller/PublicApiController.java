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
  private final EmailService emailService;

  private final Path cvUploadDir = Paths.get("uploads/cvs");

  public PublicApiController(
      EventRepository eventRepository,
      TeamMemberRepository teamMemberRepository,
      JobOfferRepository jobOfferRepository,
      PartnerRepository partnerRepository,
      JobApplicationRepository jobApplicationRepository,
      ContactMessageRepository contactMessageRepository,
      EmailService emailService) throws IOException {
    this.eventRepository = eventRepository;
    this.teamMemberRepository = teamMemberRepository;
    this.jobOfferRepository = jobOfferRepository;
    this.partnerRepository = partnerRepository;
    this.jobApplicationRepository = jobApplicationRepository;
    this.contactMessageRepository = contactMessageRepository;
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
      return ResponseEntity.ok(saved);

    } catch (IOException e) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store CV", e);
    }
  }

  @PostMapping("/public/contact")
  public ResponseEntity<ContactMessage> submitContact(@RequestBody ContactMessage contactMessage) {
    ContactMessage saved = contactMessageRepository.save(contactMessage);
    
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
    
    return ResponseEntity.ok(saved);
  }
}
