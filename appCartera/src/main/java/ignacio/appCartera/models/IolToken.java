package ignacio.appCartera.models;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class IolToken {

    @JsonProperty("access_token")
    private String token;
    @JsonProperty("refresh_token")
    private String tokenRefresh;
    @JsonProperty(".expires")
    private String expire;
}