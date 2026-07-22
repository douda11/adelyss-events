package com.adelyss.events.repository;

import com.adelyss.events.model.AdminSession;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminSessionRepository extends JpaRepository<AdminSession, Long> {
  Optional<AdminSession> findByToken(String token);

  void deleteByExpiresAtBefore(LocalDateTime cutoff);
}
