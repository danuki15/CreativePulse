package backend.GroupChat.repository;

import backend.GroupChat.model.GroupChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface GroupChatMessageRepository extends MongoRepository<GroupChatMessage, String> {
    List<GroupChatMessage> findByGroupIdOrderByTimestampAsc(String groupId);
}
