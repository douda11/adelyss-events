package com.adelyss.events.controller;

import com.adelyss.events.model.Partner;
import com.adelyss.events.repository.PartnerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners")
public class AdminPartnerController {

  private final PartnerRepository partnerRepository;

  public AdminPartnerController(PartnerRepository partnerRepository) {
    this.partnerRepository = partnerRepository;
  }

  @GetMapping
  public List<Partner> getAllPartners() {
    return partnerRepository.findAll();
  }

  @PostMapping
  public Partner createPartner(@RequestBody Partner partner) {
    return partnerRepository.save(partner);
  }

  @PutMapping("/{id}")
  public Partner updatePartner(@PathVariable Long id, @RequestBody Partner details) {
    Partner partner = partnerRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Partenaire non trouvé"));
    
    partner.setName(details.getName());
    partner.setType(details.getType());
    partner.setLogoUrl(details.getLogoUrl());
    partner.setWebsiteUrl(details.getWebsiteUrl());

    return partnerRepository.save(partner);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deletePartner(@PathVariable Long id) {
    Partner partner = partnerRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Partenaire non trouvé"));
    partnerRepository.delete(partner);
    return ResponseEntity.noContent().build();
  }
}
