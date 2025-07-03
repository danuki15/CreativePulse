package backend.GroupChat.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "GroupChatMessages")
public class GroupChatMessage {
    @Id
    private String id;
    private String groupId;
    private String userId;
    private String msg;
    private long timestamp;
    private String image; // image filename, optional

    public GroupChatMessage() {}

    public GroupChatMessage(String groupId, String userId, String msg, long timestamp) {
        this.groupId = groupId;
        this.userId = userId;
        this.msg = msg;
        this.timestamp = timestamp;
        this.image = null;
    }

    // Getters and setters...
    public String getId() { return id; }
    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getMsg() { return msg; }
    public void setMsg(String msg) { this.msg = msg; }
    public long getTimestamp() { return timestamp; }
    public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
