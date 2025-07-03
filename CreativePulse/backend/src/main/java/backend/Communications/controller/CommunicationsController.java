package backend.Communications.controller;

import backend.Communications.exception.CommunicationsNotFoundException;
import backend.Communications.model.CommunicationsModel;
import backend.Communications.repository.CommunicationsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
public class CommunicationsController {
    @Autowired
    private CommunicationsRepository communicationsRepository;

    @GetMapping("/communications/exists/{groupTitle}")
    public boolean groupTitleExists(@PathVariable String groupTitle) {
        return communicationsRepository.findAll().stream()
                .anyMatch(group -> group.getGroupTitle().equalsIgnoreCase(groupTitle));
    }

    // Insert
    @PostMapping("/communications")
    public CommunicationsModel newCommunicationsModel(@RequestBody CommunicationsModel newCommunicationsModel) {
        if (groupTitleExists(newCommunicationsModel.getGroupTitle())) {
            throw new IllegalArgumentException("Group title already exists.");
        }
        return communicationsRepository.save(newCommunicationsModel);
    }

    @GetMapping("/communications")
    List<CommunicationsModel> getAll() {
        return communicationsRepository.findAll();
    }

    @GetMapping("/communications/{id}")
    CommunicationsModel getById(@PathVariable String id) {
        return communicationsRepository.findById(id)
                .orElseThrow(() -> new CommunicationsNotFoundException(id));
    }

    @PutMapping("/communications/{id}")
    public CommunicationsModel update(@RequestBody CommunicationsModel newCommunicationsModel, @PathVariable String id) {
        return communicationsRepository.findById(id)
                .map(communicationsModel -> {
                    // Update fields
                    communicationsModel.setAdminID(newCommunicationsModel.getAdminID());
                    communicationsModel.setAdminName(newCommunicationsModel.getAdminName());
                    communicationsModel.setGroupTitle(newCommunicationsModel.getGroupTitle());
                    communicationsModel.setGroupDescription(newCommunicationsModel.getGroupDescription());
                    return communicationsRepository.save(communicationsModel);
                }).orElseThrow(() -> new CommunicationsNotFoundException(id));
    }

    @DeleteMapping("/communications/{id}")
    public void delete(@PathVariable String id) {
        communicationsRepository.deleteById(id);
    }

    @PostMapping("/communications/{id}/join")
    public CommunicationsModel joinGroup(@PathVariable String id, @RequestBody String userId) {
        // Remove quotes if present (from JSON.stringify)
        String cleanUserId = userId.replace("\"", "");
        return communicationsRepository.findById(id)
            .map(group -> {
                if (group.getGroupMembersIDs() == null) {
                    group.setGroupMembersIDs(new java.util.ArrayList<>());
                }
                // Prevent duplicate user IDs
                if (!group.getGroupMembersIDs().contains(cleanUserId)) {
                    group.getGroupMembersIDs().add(cleanUserId);
                }
                return communicationsRepository.save(group);
            })
            .orElseThrow(() -> new CommunicationsNotFoundException(id));
    }
}
