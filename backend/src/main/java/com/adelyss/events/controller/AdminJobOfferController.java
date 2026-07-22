package com.adelyss.events.controller;

import com.adelyss.events.model.JobOffer;
import com.adelyss.events.repository.JobOfferRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/job-offers")
public class AdminJobOfferController {

  private final JobOfferRepository jobOfferRepository;

  public AdminJobOfferController(JobOfferRepository jobOfferRepository) {
    this.jobOfferRepository = jobOfferRepository;
  }

  @GetMapping
  public List<JobOffer> getAllJobOffers() {
    return jobOfferRepository.findAll();
  }

  @PostMapping
  public JobOffer createJobOffer(@RequestBody JobOffer jobOffer) {
    return jobOfferRepository.save(jobOffer);
  }

  @PutMapping("/{id}")
  public JobOffer updateJobOffer(@PathVariable Long id, @RequestBody JobOffer details) {
    JobOffer jobOffer = jobOfferRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offre non trouvée"));
    
    jobOffer.setTitle(details.getTitle());
    jobOffer.setLocation(details.getLocation());
    jobOffer.setType(details.getType());
    jobOffer.setDescription(details.getDescription());
    jobOffer.setActive(details.getActive());

    return jobOfferRepository.save(jobOffer);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteJobOffer(@PathVariable Long id) {
    JobOffer jobOffer = jobOfferRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offre non trouvée"));
    jobOfferRepository.delete(jobOffer);
    return ResponseEntity.noContent().build();
  }
}
