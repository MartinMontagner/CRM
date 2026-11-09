package com.cocreadores.backend.dto.wordpress.webhook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MemberAddedDTO {
    private String id;
    private String email;
    private String username;
    @JsonProperty("display_name")
    private String displayName;
    @JsonProperty("first_name")
    private String firstName;
    @JsonProperty("last_name")
    private String lastName;
    @JsonProperty("registered_at")
    private String registeredAt;
    private AddressDto address;
    private ProfileDto profile;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AddressDto {
        @JsonProperty("mepr-address-one")
        private String meprAddressOne;
        @JsonProperty("mepr-address-two")
        private String meprAddressTwo;
        @JsonProperty("mepr-address-city")
        private String meprAddressCity;
        @JsonProperty("mepr-address-state")
        private String meprAddressState;
        @JsonProperty("mepr-address-zip")
        private String meprAddressZip;
        @JsonProperty("mepr-address-country")
        private String meprAddressCountry;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProfileDto {
        @JsonProperty("mepr_telefono")
        private String meprTelefono;
    }
}
