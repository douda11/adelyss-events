package com.adelyss.events.controller;

import com.adelyss.events.model.ContactMessage;
import com.adelyss.events.repository.ContactMessageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.adelyss.events.service.EmailService;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/admin/messages")
public class AdminContactMessageController {

    private final ContactMessageRepository repository;
    private final EmailService emailService;

    public AdminContactMessageController(ContactMessageRepository repository, EmailService emailService) {
        this.repository = repository;
        this.emailService = emailService;
    }

    @GetMapping
    public List<ContactMessage> getAllMessages() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ContactMessage> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return repository.findById(id).map(msg -> {
            msg.setStatus(body.get("status"));
            return ResponseEntity.ok(repository.save(msg));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<ContactMessage> replyToMessage(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return repository.findById(id).map(msg -> {
            String replyMessage = body.get("message");
            try {
                emailService.send(msg.getEmail(), "Réponse à votre message - Adelyss Events", replyMessage);
                msg.setStatus("REPLIED");
                return ResponseEntity.ok(repository.save(msg));
            } catch (Exception e) {
                System.err.println("Failed to send reply: " + e.getMessage());
                return ResponseEntity.internalServerError().<ContactMessage>build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
