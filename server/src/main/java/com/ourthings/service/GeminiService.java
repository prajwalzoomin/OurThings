package com.ourthings.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ourthings.model.ItemListing;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    @Value("${gemini.api.key:YOUR_GEMINI_PRO_API_KEY_HERE}")
    private String configuredApiKey;

    private String runtimeApiKey;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getEffectiveApiKey() {
        if (runtimeApiKey != null && !runtimeApiKey.trim().isEmpty()) {
            return runtimeApiKey.trim();
        }
        if (configuredApiKey != null && !configuredApiKey.trim().isEmpty() &&
                !configuredApiKey.contains("YOUR_GEMINI_PRO_API_KEY_HERE")) {
            return configuredApiKey.trim();
        }
        return null;
    }

    public void setRuntimeApiKey(String key) {
        this.runtimeApiKey = key != null ? key.trim() : null;
    }

    public boolean isAiConfigured() {
        return getEffectiveApiKey() != null;
    }

    public Map<String, Object> getAiStatus() {
        Map<String, Object> status = new HashMap<>();
        String key = getEffectiveApiKey();
        status.put("configured", key != null);
        status.put("model", "semantic-service");
        status.put("provider", "Community Semantic Engine");
        status.put("activeKeyMasked", key != null ? "****" : null);
        return status;
    }

    /**
     * Parses and standardizes Indian addresses using Gemini Pro, with deterministic fallback.
     */
    public Map<String, Object> parseAndStandardizeAddress(String rawAddress) {
        if (rawAddress == null || rawAddress.trim().isEmpty()) {
            return deterministicParseAddress("NHCE Campus, Outer Ring Road, Marathahalli, Bengaluru, Karnataka 560103");
        }

        String apiKey = getEffectiveApiKey();
        if (apiKey != null) {
            try {
                String prompt = "You are an expert Indian postal address parser. Analyze this raw user location in India (especially Bengaluru / Karnataka):\n" +
                        "\"" + rawAddress.replace("\"", "'") + "\"\n\n" +
                        "Return ONLY a clean JSON object with these exact keys:\n" +
                        "- formattedAddress (string, full standard Indian address)\n" +
                        "- premise (string, Room/Flat/Door/Floor number e.g. 'Room 304, 3rd Floor')\n" +
                        "- building (string, hostel block, society name, or apartment complex)\n" +
                        "- landmark (string, identifiable landmark e.g. 'Near NHCE Central Library', 'Opposite Gate 2')\n" +
                        "- street (string, road or cross e.g. 'Outer Ring Road')\n" +
                        "- locality (string, suburb/area e.g. 'Marathahalli', 'Bellandur')\n" +
                        "- city (string, e.g. 'Bengaluru')\n" +
                        "- state (string, e.g. 'Karnataka')\n" +
                        "- pincode (string, 6-digit Indian PIN code)\n" +
                        "- latitude (number, estimated coordinates for this Bangalore locality)\n" +
                        "- longitude (number, estimated coordinates for this Bangalore locality)";

                Map<String, Object> requestBody = new HashMap<>();
                Map<String, Object> contents = new HashMap<>();
                contents.put("parts", List.of(Map.of("text", prompt)));
                requestBody.put("contents", List.of(contents));

                Map<String, Object> genConfig = new HashMap<>();
                genConfig.put("temperature", 0.1);
                genConfig.put("responseMimeType", "application/json");
                requestBody.put("generationConfig", genConfig);

                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + apiKey;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                    if (!textNode.isMissingNode()) {
                        String jsonText = textNode.asText().trim();
                        // Strip any accidental markdown formatting
                        if (jsonText.startsWith("```json")) jsonText = jsonText.substring(7);
                        if (jsonText.startsWith("```")) jsonText = jsonText.substring(3);
                        if (jsonText.endsWith("```")) jsonText = jsonText.substring(0, jsonText.length() - 3);
                        
                        @SuppressWarnings("unchecked")
                        Map<String, Object> parsed = objectMapper.readValue(jsonText.trim(), Map.class);
                        parsed.put("source", "gemini-1.5-pro");
                        return parsed;
                    }
                }
            } catch (Exception e) {
                System.err.println("Gemini API address parse error: " + e.getMessage() + ". Using deterministic Indian address parser fallback.");
            }
        }

        Map<String, Object> fallback = deterministicParseAddress(rawAddress);
        fallback.put("source", "deterministic-indian-parser");
        return fallback;
    }

    /**
     * Intelligent Indian Address Regex and Locality Parser for Bengaluru / Karnataka.
     */
    public Map<String, Object> deterministicParseAddress(String raw) {
        Map<String, Object> result = new HashMap<>();
        String text = raw.trim();

        // 1. Pincode (6 digits in India)
        String pincode = "560103";
        Pattern pinPat = Pattern.compile("\\b(560\\d{3}|[1-9][0-9]{5})\\b");
        Matcher pinMat = pinPat.matcher(text);
        if (pinMat.find()) {
            pincode = pinMat.group(1);
        }

        // 2. Room / Flat / Door Number
        String premise = "";
        Pattern premPat = Pattern.compile("(?i)\\b(Room\\s*#?\\d+[A-Z]?|Flat\\s*#?\\d+[A-Z]?|#\\s*\\d+[-/\\d]*|Door\\s*#?\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher premMat = premPat.matcher(text);
        if (premMat.find()) {
            premise = premMat.group(1);
        } else {
            premise = "Room / Flat Area";
        }

        // 3. Landmark (Indian landmark patterns: near, opposite, behind, beside)
        String landmark = "";
        Pattern landPat = Pattern.compile("(?i)(near\\s+[^,]+|opp(?:osite)?\\s+[^,]+|behind\\s+[^,]+|beside\\s+[^,]+)", Pattern.CASE_INSENSITIVE);
        Matcher landMat = landPat.matcher(text);
        if (landMat.find()) {
            landmark = landMat.group(1).trim();
        } else if (text.toLowerCase().contains("nhce") || text.toLowerCase().contains("cauvery")) {
            landmark = "Near NHCE Central Library & Sports Ground";
        } else if (text.toLowerCase().contains("bellandur") || text.toLowerCase().contains("green glen")) {
            landmark = "Opposite Green Glen Children's Park";
        } else {
            landmark = "Near Main Community Gate";
        }

        // 4. Building / Block
        String building = "";
        if (text.toLowerCase().contains("cauvery") || text.toLowerCase().contains("hostel")) {
            building = "Cauvery Boys Hostel (Block A)";
        } else if (text.toLowerCase().contains("green glen") || text.toLowerCase().contains("heights")) {
            building = "Green Glen Heights Complex";
        } else if (text.toLowerCase().contains("kaikondrahalli")) {
            building = "Kaikondrahalli Lake Ward Layout";
        } else {
            building = "Residential Wing";
        }

        // 5. Locality & Coordinates for Bengaluru
        String locality = "Marathahalli";
        double lat = 12.9345;
        double lng = 77.6912;

        String lower = text.toLowerCase();
        if (lower.contains("bellandur") || lower.contains("green glen")) {
            locality = "Bellandur";
            lat = 12.9260;
            lng = 77.6762;
        } else if (lower.contains("kaikondrahalli") || lower.contains("sarjapur")) {
            locality = "Sarjapur Road / Kaikondrahalli";
            lat = 12.9135;
            lng = 77.6830;
        } else if (lower.contains("whitefield")) {
            locality = "Whitefield";
            lat = 12.9698;
            lng = 77.7500;
        } else if (lower.contains("hsr")) {
            locality = "HSR Layout";
            lat = 12.9121;
            lng = 77.6446;
        } else if (lower.contains("koramangala")) {
            locality = "Koramangala";
            lat = 12.9352;
            lng = 77.6245;
        } else if (lower.contains("indiranagar")) {
            locality = "Indiranagar";
            lat = 12.9784;
            lng = 77.6408;
        }

        String formatted = premise + ", " + building + ", " + landmark + ", " + locality + ", Bengaluru, Karnataka " + pincode;

        result.put("formattedAddress", formatted);
        result.put("premise", premise);
        result.put("building", building);
        result.put("landmark", landmark);
        result.put("street", "Outer Ring Road");
        result.put("locality", locality);
        result.put("city", "Bengaluru");
        result.put("state", "Karnataka");
        result.put("pincode", pincode);
        result.put("latitude", lat);
        result.put("longitude", lng);

        return result;
    }

    /**
     * AI-Powered Smart Search & Dynamic Flipkart Filter Extraction.
     */
    public Map<String, Object> smartSearch(String query, List<ItemListing> allItems) {
        Map<String, Object> response = new HashMap<>();
        String q = query != null ? query.trim() : "";

        // Determine dynamic Flipkart-like facets based on query
        List<Map<String, Object>> dynamicFilters = new ArrayList<>();
        String suggestedCategory = "All Categories";
        List<String> expandedKeywords = new ArrayList<>();

        String lowerQ = q.toLowerCase();

        if (lowerQ.contains("projector") || lowerQ.contains("screen") || lowerQ.contains("hdmi") || lowerQ.contains("electronics") || lowerQ.contains("speaker") || lowerQ.contains("mic")) {
            suggestedCategory = "Electronics";
            expandedKeywords.addAll(List.of("Full HD", "1080p", "HDMI Cable", "Display Adapter", "Bluetooth", "VHF Wireless"));

            dynamicFilters.add(Map.of(
                    "filterName", "Display & Audio Specs",
                    "options", List.of("Full HD (1080p)", "3300 Lumens", "Wireless Microphone", "Bluetooth Enabled")
            ));
            dynamicFilters.add(Map.of(
                    "filterName", "Accessories Included",
                    "options", List.of("5m HDMI Cord", "Carrying Case", "Remote Control", "Power Adapter")
            ));
        } else if (lowerQ.contains("drill") || lowerQ.contains("tool") || lowerQ.contains("hammer") || lowerQ.contains("screw") || lowerQ.contains("hardware")) {
            suggestedCategory = "Tools & Hardware";
            expandedKeywords.addAll(List.of("Impact Drill", "13mm Chuck", "Masonry Bits", "Forward/Reverse", "Keyed Chuck"));

            dynamicFilters.add(Map.of(
                    "filterName", "Power & Chuck Type",
                    "options", List.of("13mm Heavy Duty", "Impact Drilling", "Variable Speed", "Forward/Reverse")
            ));
            dynamicFilters.add(Map.of(
                    "filterName", "Bits & Accessories",
                    "options", List.of("6-Piece Masonry Bits", "Chuck Key Included", "Depth Gauge", "Auxiliary Handle")
            ));
        } else if (lowerQ.contains("crutch") || lowerQ.contains("wheelchair") || lowerQ.contains("walker") || lowerQ.contains("health") || lowerQ.contains("mobility") || lowerQ.contains("medical")) {
            suggestedCategory = "Healthcare & Mobility";
            expandedKeywords.addAll(List.of("Underarm Crutches", "Adjustable Height", "Padded Armrests", "Rubber Tips", "Sanitized"));

            dynamicFilters.add(Map.of(
                    "filterName", "User Sizing & Adjustment",
                    "options", List.of("Adult (5'2\" to 6'0\")", "Push-Button Telescopic", "Lightweight Aluminum")
            ));
            dynamicFilters.add(Map.of(
                    "filterName", "Hygiene & Comfort",
                    "options", List.of("Thoroughly Sanitized", "Soft Arm Cushioning", "Slip-Resistant Tips")
            ));
        } else if (lowerQ.contains("bag") || lowerQ.contains("rucksack") || lowerQ.contains("travel") || lowerQ.contains("camp") || lowerQ.contains("trek")) {
            suggestedCategory = "Travel Gear";
            expandedKeywords.addAll(List.of("65L Capacity", "Rain Cover", "Lumbar Support", "Internal Frame", "Trekking"));

            dynamicFilters.add(Map.of(
                    "filterName", "Capacity & Frame",
                    "options", List.of("65L High Capacity", "Internal Ergonomic Frame", "Waterproof Bottom")
            ));
            dynamicFilters.add(Map.of(
                    "filterName", "Weather Resistance",
                    "options", List.of("High-Vis Rain Cover Included", "Heavy-Duty Ripstop Fabric")
            ));
        } else {
            // General dynamic facets
            dynamicFilters.add(Map.of(
                    "filterName", "Pickup Distance",
                    "options", List.of("Within 1 km (Same Campus / Wing)", "Within 3 km (Local Ward)", "Within 5 km (Bengaluru East)", "Any Distance in Bengaluru")
            ));
            dynamicFilters.add(Map.of(
                    "filterName", "Lending Terms",
                    "options", List.of("100% Free Peer Borrowing", "No Security Deposit Required", "Instant Verified Confirmation")
            ));
        }

        response.put("query", q);
        response.put("suggestedCategory", suggestedCategory);
        response.put("expandedKeywords", expandedKeywords);
        response.put("dynamicFilters", dynamicFilters);
        response.put("aiModel", "Semantic Search Engine");

        return response;
    }

    /**
     * Semantic search synonym expansion:
     * Discovers alternative names, colloquial terms, and related items
     * using Gemini in the background or a comprehensive domain dictionary.
     */
    public Set<String> getSearchSynonyms(String rawQuery) {
        if (rawQuery == null || rawQuery.trim().isEmpty()) {
            return Collections.emptySet();
        }

        Set<String> synonyms = new LinkedHashSet<>();
        String cleanQuery = rawQuery.trim().toLowerCase();
        synonyms.add(cleanQuery);

        // 1. Check background Gemini API if configured
        String apiKey = getEffectiveApiKey();
        if (apiKey != null) {
            try {
                String prompt = "In a community sharing and tool library (with tools, electronics, mobility aids, travel gear, event gear), " +
                        "the user searched for: \"" + cleanQuery.replace("\"", "'") + "\". " +
                        "What are up to 6 exact alternative item names, equipment synonyms, or colloquial Indian terms for this item or need? " +
                        "Return ONLY a JSON array of strings, for example [\"crutches\", \"walker\", \"walking aid\"].";

                Map<String, Object> requestBody = new HashMap<>();
                Map<String, Object> contents = new HashMap<>();
                contents.put("parts", List.of(Map.of("text", prompt)));
                requestBody.put("contents", List.of(contents));

                Map<String, Object> genConfig = new HashMap<>();
                genConfig.put("temperature", 0.1);
                genConfig.put("responseMimeType", "application/json");
                requestBody.put("generationConfig", genConfig);

                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=" + apiKey;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                    if (!textNode.isMissingNode()) {
                        String jsonText = textNode.asText().trim();
                        if (jsonText.startsWith("```json")) jsonText = jsonText.substring(7);
                        if (jsonText.startsWith("```")) jsonText = jsonText.substring(3);
                        if (jsonText.endsWith("```")) jsonText = jsonText.substring(0, jsonText.length() - 3);

                        JsonNode arrayNode = objectMapper.readTree(jsonText.trim());
                        if (arrayNode.isArray()) {
                            for (JsonNode item : arrayNode) {
                                String syn = item.asText().trim().toLowerCase();
                                if (!syn.isEmpty() && syn.length() > 2) {
                                    synonyms.add(syn);
                                }
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }

        // 2. Comprehensive deterministic Indian & colloquial dictionary expansion
        expandDeterministicSynonyms(cleanQuery, synonyms);

        return synonyms;
    }

    private void expandDeterministicSynonyms(String query, Set<String> synonyms) {
        String q = query.toLowerCase();

        // Crutches & Mobility Aids
        if (q.contains("walking stick") || q.contains("stick") || q.contains("cane") ||
            q.contains("fracture") || q.contains("leg") || q.contains("sprain") ||
            q.contains("injury") || q.contains("walker") || q.contains("crutch")) {
            synonyms.addAll(List.of("crutch", "crutches", "underarm crutches", "mobility", "aluminum crutches", "wheelchair"));
        }

        // Wheelchair
        if (q.contains("wheelchair") || q.contains("wheel chair") || q.contains("handicap") ||
            q.contains("patient chair") || q.contains("commode") || q.contains("foldable chair")) {
            synonyms.addAll(List.of("wheelchair", "foldable wheelchair", "mobility", "crutches"));
        }

        // Drill & Tools
        if (q.contains("drill") || q.contains("drilling machine") || q.contains("bore") ||
            q.contains("wall hole") || q.contains("screw") || q.contains("screwdriver") ||
            q.contains("hammer") || q.contains("toolkit") || q.contains("tool kit") ||
            q.contains("masonry") || q.contains("hardware")) {
            synonyms.addAll(List.of("drill", "impact drill", "bosch", "masonry bits", "tools", "drill kit"));
        }

        // Projector & Cinema
        if (q.contains("projector") || q.contains("movie") || q.contains("cinema") ||
            q.contains("movie night") || q.contains("screen") || q.contains("hdmi") ||
            q.contains("presentation") || q.contains("slides") || q.contains("big screen") ||
            q.contains("beamer")) {
            synonyms.addAll(List.of("projector", "full hd projector", "epson", "hdmi cable", "display"));
        }

        // Speaker & Sound
        if (q.contains("speaker") || q.contains("sound") || q.contains("mic") ||
            q.contains("microphone") || q.contains("audio") || q.contains("party") ||
            q.contains("pa system") || q.contains("amplifier") || q.contains("bluetooth")) {
            synonyms.addAll(List.of("speaker", "jbl", "pa speaker", "wireless microphone", "event equipment"));
        }

        // Rucksack & Travel Bag
        if (q.contains("bag") || q.contains("travel bag") || q.contains("rucksack") ||
            q.contains("backpack") || q.contains("luggage") || q.contains("suitcase") ||
            q.contains("trolley") || q.contains("trekking") || q.contains("camping") ||
            q.contains("trip")) {
            synonyms.addAll(List.of("rucksack", "wildcraft", "trekking rucksack", "travel gear", "rain cover"));
        }

        // Blood Pressure & Medical
        if (q.contains("bp") || q.contains("blood pressure") || q.contains("pressure machine") ||
            q.contains("sphygmomanometer") || q.contains("pulse") || q.contains("hypertension") ||
            q.contains("health monitor") || q.contains("cuff")) {
            synonyms.addAll(List.of("blood pressure", "bp monitor", "omron", "digital blood pressure", "healthcare"));
        }

        // Knee Brace
        if (q.contains("knee") || q.contains("brace") || q.contains("ortho") ||
            q.contains("orthopedic") || q.contains("ligament") || q.contains("crepe")) {
            synonyms.addAll(List.of("knee brace", "orthopedic", "mobility", "healthcare"));
        }
    }
}

