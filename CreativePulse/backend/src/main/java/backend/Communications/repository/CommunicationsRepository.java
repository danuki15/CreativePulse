package backend.Communications.repository;

import backend.Communications.model.CommunicationsModel;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CommunicationsRepository extends MongoRepository<CommunicationsModel,String> {
}
