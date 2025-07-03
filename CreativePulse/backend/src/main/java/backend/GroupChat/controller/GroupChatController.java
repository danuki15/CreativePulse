package backend.GroupChat.controller;

import backend.GroupChat.model.GroupChatMessage;
import backend.GroupChat.repository.GroupChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/groupChat")
public class GroupChatController {
    @Autowired
    private GroupChatMessageRepository messageRepository;

    private static final String CHAT_IMG_UPLOAD_DIR = "uploads/ChatImg";

    @GetMapping("/{groupId}/messages")
    public List<GroupChatMessage> getMessages(@PathVariable String groupId) {
        return messageRepository.findByGroupIdOrderByTimestampAsc(groupId);
    }

    @PostMapping("/uploadImage")
    public ResponseEntity<?> uploadChatImage(@RequestParam("file") MultipartFile file) {
        try {
            File uploadDir = new File(System.getProperty("user.dir"), CHAT_IMG_UPLOAD_DIR);
            if (!uploadDir.exists()) uploadDir.mkdirs();

            String extension = "";
            String original = file.getOriginalFilename();
            int i = original.lastIndexOf('.');
            if (i > 0) extension = original.substring(i);
            String uniqueName = UUID.randomUUID().toString() + extension;

            Path filePath = uploadDir.toPath().resolve(uniqueName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(Map.of("fileName", uniqueName));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Image upload failed"));
        }
    }

    @GetMapping("/images/{fileName}")
    public ResponseEntity<?> getChatImage(@PathVariable String fileName) {
        try {
            File uploadDir = new File(System.getProperty("user.dir"), CHAT_IMG_UPLOAD_DIR);
            Path filePath = uploadDir.toPath().resolve(fileName);
            if (!Files.exists(filePath)) return ResponseEntity.notFound().build();
            byte[] image = Files.readAllBytes(filePath);
            return ResponseEntity.ok().body(image);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/{groupId}/messages")
    public GroupChatMessage postMessage(@PathVariable String groupId, @RequestBody Map<String, Object> body) {
        String userId = (String) body.get("userId");
        String msg = (String) body.get("msg");
        String image = body.get("image") != null ? (String) body.get("image") : null;
        GroupChatMessage message = new GroupChatMessage(groupId, userId, msg, System.currentTimeMillis());
        message.setImage(image);
        return messageRepository.save(message);
    }

    @DeleteMapping("/messages/{msgId}")
    public ResponseEntity<?> deleteMessage(@PathVariable String msgId) {
        Optional<GroupChatMessage> msg = messageRepository.findById(msgId);
        if (msg.isPresent()) {
            // Delete image file if exists
            String image = msg.get().getImage();
            if (image != null && !image.isEmpty()) {
                File uploadDir = new File(System.getProperty("user.dir"), CHAT_IMG_UPLOAD_DIR);
                Path filePath = uploadDir.toPath().resolve(image);
                try { Files.deleteIfExists(filePath); } catch (Exception ignored) {}
            }
            messageRepository.deleteById(msgId);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Message not found");
        }
    }

    @PutMapping("/messages/{msgId}")
    public ResponseEntity<?> updateMessage(@PathVariable String msgId, @RequestBody Map<String, String> body) {
        Optional<GroupChatMessage> msgOpt = messageRepository.findById(msgId);
        if (msgOpt.isPresent()) {
            GroupChatMessage msg = msgOpt.get();
            String newMsg = body.get("msg");
            msg.setMsg(newMsg);
            messageRepository.save(msg);
            return ResponseEntity.ok(msg);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Message not found");
        }
    }
}
