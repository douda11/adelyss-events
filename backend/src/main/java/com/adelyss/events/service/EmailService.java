package com.adelyss.events.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.internet.MimeMessage;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {
  private final JavaMailSender mailSender;

  @Value("${spring.mail.username:contact@adelyss-events.com}")
  private String fromEmail;

  public EmailService(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  public void send(String to, String subject, String body) {
    // 1. Priorité au relais HTTP HTTPS (Port 443) pour contourner le blocage SMTP des hébergeurs cloud gratuits (Render)
    if (sendViaHttpRelay(to, subject, body)) {
      return;
    }

    // 2. Repli vers SMTP classique (JavaMailSender)
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom(fromEmail, "Adelyss Events");
      helper.setTo(to);
      helper.setSubject(subject);

      // Convertir les retours à la ligne du texte en balises <br> pour le HTML
      String htmlBody = body.replace("\n", "<br>");

      // Création de la signature HTML
      String signature = "<br><br>"
          + "<hr style='border: none; border-top: 1px solid #ccc; margin-top: 20px; margin-bottom: 20px;' />"
          + "<div style='font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5;'>"
          + "  <img src='https://adelyss-events.com/assets/logo.png' alt='Adelyss Events' style='max-height: 50px; margin-bottom: 10px; display: block;' />"
          + "  <strong>L'équipe Adelyss Events</strong><br>"
          + "  <em>Événements professionnels, associatifs et privés</em><br><br>"
          + "  <strong>Tél :</strong> +216 25 944 684<br>"
          + "  <strong>Web :</strong> <a href='https://adelyss-events.com' style='color: #c9a227; text-decoration: none;'>adelyss-events.com</a>"
          + "</div>";

      helper.setText(htmlBody + signature, true); // true = c'est du HTML

      mailSender.send(message);
      System.out.println("Email sent successfully via JavaMail to: " + to + " (Subject: " + subject + ")");
    } catch (Exception e) {
      System.err.println("Error sending email via JavaMail to " + to + " (Subject: " + subject + "): " + e.getMessage());
      e.printStackTrace();
    }
  }

  private boolean sendViaHttpRelay(String to, String subject, String body) {
    try {
      URL url = new URL("https://adelyss-events.com/.netlify/functions/send-email");
      HttpURLConnection conn = (HttpURLConnection) url.openConnection();
      conn.setRequestMethod("POST");
      conn.setRequestProperty("Content-Type", "application/json; charset=utf-8");
      conn.setRequestProperty("X-Api-Key", "AdelyssEmailSecret2026!");
      conn.setConnectTimeout(8000);
      conn.setReadTimeout(12000);
      conn.setDoOutput(true);

      String jsonPayload = String.format(
          "{\"to\":\"%s\",\"subject\":\"%s\",\"body\":\"%s\"}",
          escapeJson(to),
          escapeJson(subject),
          escapeJson(body)
      );

      byte[] postData = jsonPayload.getBytes(StandardCharsets.UTF_8);
      try (OutputStream os = conn.getOutputStream()) {
        os.write(postData);
        os.flush();
      }

      int responseCode = conn.getResponseCode();
      if (responseCode >= 200 && responseCode < 300) {
        System.out.println("Email sent successfully via HTTP Relay to: " + to + " (Subject: " + subject + ")");
        return true;
      } else {
        System.err.println("HTTP Relay returned status code: " + responseCode);
      }
    } catch (Exception e) {
      System.err.println("HTTP Relay dispatch attempt failed: " + e.getMessage());
    }
    return false;
  }

  private String escapeJson(String input) {
    if (input == null) return "";
    return input.replace("\\", "\\\\")
        .replace("\"", "\\\"")
        .replace("\b", "\\b")
        .replace("\f", "\\f")
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t");
  }
}
