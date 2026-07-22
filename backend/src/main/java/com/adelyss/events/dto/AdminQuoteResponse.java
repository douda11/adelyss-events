package com.adelyss.events.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AdminQuoteResponse {
  private Long id;
  private String fullName;
  private String email;
  private String phone;
  private String eventType;
  private LocalDate eventDate;
  private BigDecimal estimatedBudget;
  private String details;
  private String status;
  private String adminReplyMessage;
  private String repliedBy;
  private LocalDateTime repliedAt;
  private LocalDateTime createdAt;

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
