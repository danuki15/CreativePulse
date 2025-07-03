package backend.Communications.exception;

public class CommunicationsNotFoundException extends RuntimeException{
    public CommunicationsNotFoundException(String id){
        super("Could not found with id"+id);
    }
}
