package backend.Communications.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.ArrayList;

@Document(collection = "Communications")
public class CommunicationsModel {
    @Id
    @GeneratedValue
    private String id;
    private String adminID;
    private String adminName;
    private String groupTitle;
    private String groupDescription;
    private List<String> groupMembersIDs = new ArrayList<>();

    public CommunicationsModel() {

    }

    public CommunicationsModel(String id, String adminID, String adminName, String groupTitle, String groupDescription) {
        this.id = id;
        this.adminID = adminID;
        this.adminName = adminName;
        this.groupTitle = groupTitle;
        this.groupDescription = groupDescription;
        this.groupMembersIDs = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAdminID() {
        return adminID;
    }

    public void setAdminID(String adminID) {
        this.adminID = adminID;
    }

    public String getAdminName() {
        return adminName;
    }

    public void setAdminName(String adminName) {
        this.adminName = adminName;
    }

    public String getGroupTitle() {
        return groupTitle;
    }

    public void setGroupTitle(String groupTitle) {
        this.groupTitle = groupTitle;
    }

    public String getGroupDescription() {
        return groupDescription;
    }

    public void setGroupDescription(String groupDescription) {
        this.groupDescription = groupDescription;
    }

    public List<String> getGroupMembersIDs() {
        return groupMembersIDs;
    }

    public void setGroupMembersIDs(List<String> groupMembersIDs) {
        this.groupMembersIDs = groupMembersIDs;
    }
}
