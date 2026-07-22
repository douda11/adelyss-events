package com.adelyss.events.controller;

import com.adelyss.events.model.JobApplication;
import com.adelyss.events.repository.JobApplicationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/applications")
public class AdminApplicationController {

  private final JobApplicationRepository jobApplicationRepository;

  public AdminApplicationController(JobApplicationRepository jobApplicationRepository) {
    this.jobApplicationRepository = jobApplicationRepository;
  }

  @GetMapping
  public List<JobApplication> getAllApplications() {
    return jobApplicationRepository.findAll();
  }

  @PutMapping("/{id}/status")
  public JobApplication updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
    JobApplication application = jobApplicationRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature non trouvée"));
    
    if (body.containsKey("status")) {
      application.setStatus(body.get("status"));
    }
    return jobApplicationRepository.save(application);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
    JobApplication application = jobApplicationRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidature non trouvée"));
    jobApplicationRepository.delete(application);
    return ResponseEntity.noContent().build();
  }
}
