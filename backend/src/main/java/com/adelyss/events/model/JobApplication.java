package com.adelyss.events.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
public class JobApplication {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String fullName;

  @Column(nullable = false)
  private String email;

  private String phone;

  @Column(nullable = false)
  private String position;

  @Column(columnDefinition = "TEXT")
  private String motivation;

  private String cvUrl;

  private String status = "NEW"; // NEW, REVIEWED, ACCEPTED, REJECTED

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  public void prePersist() {
    if (createdAt == null) createdAt = LocalDateTime.now();
  }

  // Getters and Setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public String getFullName() { return fullName; }
  public void setFullName(String fullName) { this.fullName = fullName; }
  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }
  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }
  public String getPosition() { return position; }
  public void setPosition(String position) { this.position = position; }
  public String getMotivation() { return motivation; }
  public void setMotivation(String motivation) { this.motivation = motivation; }
  public String getCvUrl() { return cvUrl; }
  public void setCvUrl(String cvUrl) { this.cvUrl = cvUrl; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
