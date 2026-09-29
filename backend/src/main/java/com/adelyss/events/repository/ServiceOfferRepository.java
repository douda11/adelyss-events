package com.adelyss.events.repository;

import com.adelyss.events.model.ServiceOffer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceOfferRepository extends JpaRepository<ServiceOffer, Long> {
  List<ServiceOffer> findByActiveTrueOrderByDisplayOrderAsc();
}
