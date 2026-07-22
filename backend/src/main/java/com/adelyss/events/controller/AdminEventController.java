package com.adelyss.events.controller;

import com.adelyss.events.model.Event;
import com.adelyss.events.repository.EventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
public class AdminEventController {

  private final EventRepository eventRepository;

  public AdminEventController(EventRepository eventRepository) {
    this.eventRepository = eventRepository;
  }

  @GetMapping
  public List<Event> getAllEvents() {
    return eventRepository.findAll();
  }

  @GetMapping("/{id}")
  public Event getEvent(@PathVariable Long id) {
    return eventRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event non trouvé"));
  }

  @PostMapping
  public Event createEvent(@RequestBody Event event) {
    return eventRepository.save(event);
  }

  @PutMapping("/{id}")
  public Event updateEvent(@PathVariable Long id, @RequestBody Event eventDetails) {
    Event event = eventRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event non trouvé"));
    
    event.setTitle(eventDetails.getTitle());
    event.setDate(eventDetails.getDate());
    event.setLocation(eventDetails.getLocation());
    event.setDescription(eventDetails.getDescription());
    event.setImageUrl(eventDetails.getImageUrl());
    event.setStatus(eventDetails.getStatus());

    return eventRepository.save(event);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
    Event event = eventRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event non trouvé"));
    eventRepository.delete(event);
    return ResponseEntity.noContent().build();
  }
}
