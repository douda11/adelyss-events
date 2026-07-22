package com.adelyss.events.dto;

import javax.validation.constraints.NotBlank;

public class AdminQuoteReplyRequest {
  @NotBlank
  private String subject;

  @NotBlank
  private String message;

  private String status;

  public String getSubject() {
    return subject;
  }

  public void setSubject(String subject) {
    this.subject = subject;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
}
