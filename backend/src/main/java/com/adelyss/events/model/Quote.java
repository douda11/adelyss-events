package com.adelyss.events.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.PrePersist;
import javax.persistence.Table;

@Entity
@Table(name = "quotes")
public class Quote {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 120)
  private String fullName;

  @Column(nullable = false, length = 150)
  private String email;

  @Column(nullable = false, length = 30)
  private String phone;

  @Column(nullable = false, length = 60)
  private String eventType;

  private LocalDate eventDate;

  @Column(precision = 12, scale = 2)
  private BigDecimal estimatedBudget;

  @Column(columnDefinition = "TEXT")
  private String details;

  @Column(nullable = false, length = 20)
  private String status;

  @Column(columnDefinition = "TEXT")
  private String adminReplyMessage;

  @Column(length = 150)
  private String repliedBy;

  private LocalDateTime repliedAt;

  @Column(nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @PrePersist
  public void prePersist() {
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
    if (status == null || status.trim().isEmpty()) {
      status = "NEW";
    }
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getFullName() {
    return fullName;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getEventType() {
    return eventType;
  }

  public void setEventType(String eventType) {
    this.eventType = eventType;
  }

  public LocalDate getEventDate() {
    return eventDate;
  }

  public void setEventDate(LocalDate eventDate) {
    this.eventDate = eventDate;
  }

  public BigDecimal getEstimatedBudget() {
    return estimatedBudget;
  }

  public void setEstimatedBudget(BigDecimal estimatedBudget) {
    this.estimatedBudget = estimatedBudget;
  }

  public String getDetails() {
    return details;
  }

  public void setDetails(String details) {
    this.details = details;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getAdminReplyMessage() {
    return adminReplyMessage;
  }

  public void setAdminReplyMessage(String adminReplyMessage) {
    this.adminReplyMessage = adminReplyMessage;
  }

  public String getRepliedBy() {
    return repliedBy;
  }

  public void setRepliedBy(String repliedBy) {
    this.repliedBy = repliedBy;
  }

  public LocalDateTime getRepliedAt() {
    return repliedAt;
  }

  public void setRepliedAt(LocalDateTime repliedAt) {
    this.repliedAt = repliedAt;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }
}
