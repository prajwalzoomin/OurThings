package com.ourthings.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class LocationService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // Known Bengaluru locality reference centroids for offline / fallback proximity estimation
    private static final List<LocalityRef> BENGALURU_HUBS = List.of(
            new LocalityRef("Marathahalli", 12.9345, 77.6912, "560103"),
            new LocalityRef("Bellandur", 12.9260, 77.6762, "560103"),
            new LocalityRef("Kaikondrahalli / Sarjapur Rd", 12.9135, 77.6830, "560035"),
            new LocalityRef("HSR Layout", 12.9121, 77.6446, "560102"),
            new LocalityRef("Koramangala", 12.9352, 77.6245, "560034"),
            new LocalityRef("Indiranagar", 12.9784, 77.6408, "560038"),
            new LocalityRef("Whitefield", 12.9698, 77.7500, "560066"),
            new LocalityRef("Electronic City", 12.8452, 77.6602, "560100"),
            new LocalityRef("BTM Layout", 12.9166, 77.6101, "560076"),
            new LocalityRef("Jayanagar", 12.9308, 77.5838, "560011"),
            new LocalityRef("JP Nagar", 12.9077, 77.5855, "560078"),
            new LocalityRef("Hebbal", 13.0358, 77.5970, "560024"),
            new LocalityRef("Yelahanka", 13.1007, 77.5963, "560064"),
            new LocalityRef("Malleshwaram", 13.0031, 77.5643, "560003"),
            new LocalityRef("Rajajinagar", 12.9982, 77.5530, "560010"),
            new LocalityRef("MG Road / Central", 12.9756, 77.6066, "560001"),
            new LocalityRef("Banashankari", 12.9255, 77.5468, "560070")
    );

    private static class LocalityRef {
        final String name;
        final double lat;
        final double lng;
        final String pincode;

        LocalityRef(String name, double lat, double lng, String pincode) {
            this.name = name;
            this.lat = lat;
            this.lng = lng;
            this.pincode = pincode;
        }
    }

    public LocationService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(4000);
        factory.setReadTimeout(4000);
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Accurately reverse geocodes real GPS coordinates using OpenStreetMap Nominatim.
     */
    public Map<String, Object> reverseGeocode(double lat, double lng) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("latitude", lat);
        result.put("longitude", lng);

        try {
            URI uri = URI.create(String.format(Locale.US, "https://nominatim.openstreetmap.org/reverse?format=json&lat=%.6f&lon=%.6f&addressdetails=1&zoom=18", lat, lng));
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "OurThings-Community-App/1.0 (nhce-project; contact@ourthings.local)");
            headers.set("Accept", "application/json");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode addr = root.path("address");

                String road = addr.path("road").asText("");
                if (road.isEmpty()) road = addr.path("pedestrian").asText("");
                if (road.isEmpty()) road = addr.path("street").asText("");

                String locality = addr.path("suburb").asText("");
                if (locality.isEmpty()) locality = addr.path("neighbourhood").asText("");
                if (locality.isEmpty()) locality = addr.path("residential").asText("");
                if (locality.isEmpty()) locality = addr.path("subdistrict").asText("");
                if (locality.isEmpty()) locality = addr.path("quarter").asText("");

                String city = addr.path("city").asText("");
                if (city.isEmpty()) city = addr.path("town").asText("");
                if (city.isEmpty()) city = addr.path("city_district").asText("");
                if (city.isEmpty()) city = addr.path("county").asText("");
                if (city.isEmpty()) city = "Bengaluru";

                String state = addr.path("state").asText("Karnataka");
                String pincode = addr.path("postcode").asText("");

                String displayName = root.path("display_name").asText("");

                String resolvedLocality = !locality.isEmpty() ? locality : (!road.isEmpty() ? road : city);

                result.put("locality", resolvedLocality);
                result.put("street", road);
                result.put("city", city);
                result.put("state", state);
                result.put("pincode", pincode);
                result.put("formattedAddress", displayName);
                result.put("isLiveGeocoded", true);
                return result;
            }
        } catch (Exception e) {
            System.err.println("Nominatim reverse geocode notice: " + e.getMessage());
        }

        // Proximity-based nearest area calculation fallback
        return estimateBengaluruLocality(lat, lng);
    }

    /**
     * Forward geocodes a location query (e.g. "HSR Layout", "Indiranagar", "Electronic City")
     * so user can search and jump to any place on the map accurately.
     */
    public List<Map<String, Object>> searchPlace(String query) {
        List<Map<String, Object>> results = new ArrayList<>();
        if (query == null || query.trim().isEmpty()) {
            return results;
        }

        try {
            String encodedQuery = URLEncoder.encode(query.trim() + " Bengaluru", StandardCharsets.UTF_8);
            URI uri = URI.create("https://nominatim.openstreetmap.org/search?format=json&q=" + encodedQuery + "&limit=6&addressdetails=1");

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "OurThings-Community-App/1.0 (nhce-project; contact@ourthings.local)");
            headers.set("Accept", "application/json");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.isArray()) {
                    for (JsonNode item : root) {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("latitude", item.path("lat").asDouble());
                        map.put("longitude", item.path("lon").asDouble());
                        map.put("displayName", item.path("display_name").asText());

                        JsonNode addr = item.path("address");
                        String locality = addr.path("suburb").asText("");
                        if (locality.isEmpty()) locality = addr.path("neighbourhood").asText("");
                        if (locality.isEmpty()) locality = addr.path("residential").asText("");

                        map.put("locality", !locality.isEmpty() ? locality : item.path("name").asText(""));
                        map.put("city", addr.path("city").asText("Bengaluru"));
                        map.put("pincode", addr.path("postcode").asText(""));
                        results.add(map);
                    }
                    return results;
                }
            }
        } catch (Exception e) {
            System.err.println("Nominatim forward search notice: " + e.getMessage());
        }

        // Fallback matching against known hubs
        String qLower = query.toLowerCase();
        for (LocalityRef hub : BENGALURU_HUBS) {
            if (hub.name.toLowerCase().contains(qLower) || qLower.contains(hub.name.toLowerCase().split("/")[0].trim())) {
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("latitude", hub.lat);
                map.put("longitude", hub.lng);
                map.put("displayName", hub.name + ", Bengaluru, Karnataka " + hub.pincode);
                map.put("locality", hub.name);
                map.put("city", "Bengaluru");
                map.put("pincode", hub.pincode);
                results.add(map);
            }
        }

        return results;
    }

    /**
     * Calculates the nearest real Bengaluru locality based on closest Euclidean distance,
     * without making false assumptions like hardcoding Marathahalli or Cauvery Hostel.
     */
    public Map<String, Object> estimateBengaluruLocality(double lat, double lng) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("latitude", lat);
        result.put("longitude", lng);

        LocalityRef closest = null;
        double minDistance = Double.MAX_VALUE;

        for (LocalityRef hub : BENGALURU_HUBS) {
            double dLat = hub.lat - lat;
            double dLng = hub.lng - lng;
            double distSq = dLat * dLat + dLng * dLng;
            if (distSq < minDistance) {
                minDistance = distSq;
                closest = hub;
            }
        }

        if (closest != null) {
            result.put("locality", closest.name);
            result.put("street", "");
            result.put("city", "Bengaluru");
            result.put("state", "Karnataka");
            result.put("pincode", closest.pincode);
            result.put("formattedAddress", closest.name + ", Bengaluru, Karnataka " + closest.pincode);
        } else {
            result.put("locality", "Bengaluru");
            result.put("street", "");
            result.put("city", "Bengaluru");
            result.put("state", "Karnataka");
            result.put("pincode", "560001");
            result.put("formattedAddress", "Bengaluru, Karnataka");
        }

        result.put("isLiveGeocoded", false);
        return result;
    }
}
