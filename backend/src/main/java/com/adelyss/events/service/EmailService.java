package com.adelyss.events.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.internet.MimeMessage;

@Service
public class EmailService {
  private final JavaMailSender mailSender;

  @Value("${spring.mail.username}")
  private String fromEmail;

  public EmailService(JavaMailSender mailSender) {
    this.mailSender = mailSender;
  }

  public void send(String to, String subject, String body) {
    try {
      MimeMessage message = mailSender.createMimeMessage();
      MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

      helper.setFrom("AdelyssEvents <" + fromEmail + ">");
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
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
