package com.adelyss.events.repository;

import com.adelyss.events.model.Quote;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuoteRepository extends JpaRepository<Quote, Long> {
  List<Quote> findAllByOrderByCreatedAtDesc();
}
