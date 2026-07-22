package com.adelyss.events.controller;

import com.adelyss.events.model.TeamMember;
import com.adelyss.events.repository.TeamMemberRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/team")
public class AdminTeamController {

  private final TeamMemberRepository teamMemberRepository;

  public AdminTeamController(TeamMemberRepository teamMemberRepository) {
    this.teamMemberRepository = teamMemberRepository;
  }

  @GetMapping
  public List<TeamMember> getAllTeamMembers() {
    return teamMemberRepository.findAll();
  }

  @GetMapping("/{id}")
  public TeamMember getTeamMember(@PathVariable Long id) {
    return teamMemberRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre non trouvé"));
  }

  @PostMapping
  public TeamMember createTeamMember(@RequestBody TeamMember teamMember) {
    return teamMemberRepository.save(teamMember);
  }

  @PutMapping("/{id}")
  public TeamMember updateTeamMember(@PathVariable Long id, @RequestBody TeamMember details) {
    TeamMember member = teamMemberRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre non trouvé"));
    
    member.setFirstName(details.getFirstName());
    member.setLastName(details.getLastName());
    member.setRole(details.getRole());
    member.setBio(details.getBio());
    member.setImageUrl(details.getImageUrl());
    member.setActive(details.getActive());

    return teamMemberRepository.save(member);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteTeamMember(@PathVariable Long id) {
    TeamMember member = teamMemberRepository.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre non trouvé"));
    teamMemberRepository.delete(member);
    return ResponseEntity.noContent().build();
  }
}
