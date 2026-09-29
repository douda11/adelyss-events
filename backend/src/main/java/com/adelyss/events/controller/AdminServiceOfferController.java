package com.adelyss.events.controller;

import com.adelyss.events.model.ServiceOffer;
import com.adelyss.events.repository.ServiceOfferRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/services")
public class AdminServiceOfferController {

  private final ServiceOfferRepository serviceOfferRepository;

  public AdminServiceOfferController(ServiceOfferRepository serviceOfferRepository) {
    this.serviceOfferRepository = serviceOfferRepository;
  }

  @GetMapping
  public List<ServiceOffer> getAllServices() {
    return serviceOfferRepository.findAll();
  }

  @PostMapping
  public ServiceOffer createService(@RequestBody ServiceOffer service) {
    return serviceOfferRepository.save(service);
  }

  @PutMapping("/{id}")
  public ServiceOffer updateService(@PathVariable Long id, @RequestBody ServiceOffer details) {
    ServiceOffer service = serviceOfferRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prestation non trouvée"));

    service.setTitle(details.getTitle());
    service.setDescription(details.getDescription());
    service.setIcon(details.getIcon());
    service.setImageUrl(details.getImageUrl());
    service.setDisplayOrder(details.getDisplayOrder());
    service.setActive(details.getActive());

    return serviceOfferRepository.save(service);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteService(@PathVariable Long id) {
    ServiceOffer service = serviceOfferRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Prestation non trouvée"));
    serviceOfferRepository.delete(service);
    return ResponseEntity.noContent().build();
  }
}
