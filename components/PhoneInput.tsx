/**
 * Custom Phone Input Component
 * Uses libphonenumber-js for phone number formatting and validation
 * Works on all platforms including web
 */
import {
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Common countries at top, then rest alphabetically
const COMMON_COUNTRIES: CountryCode[] = [
  "US",
  "GB",
  "CA",
  "AU",
  "TR",
  "DE",
  "FR",
  "ES",
  "IT",
  "NL",
];

interface CountryData {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

// Country flag emoji from country code
const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Country names
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  TR: "Turkey",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  BE: "Belgium",
  AT: "Austria",
  CH: "Switzerland",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  PL: "Poland",
  PT: "Portugal",
  GR: "Greece",
  IE: "Ireland",
  NZ: "New Zealand",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  IN: "India",
  BR: "Brazil",
  MX: "Mexico",
  AR: "Argentina",
  CO: "Colombia",
  CL: "Chile",
  PE: "Peru",
  ZA: "South Africa",
  EG: "Egypt",
  NG: "Nigeria",
  KE: "Kenya",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  IL: "Israel",
  RU: "Russia",
  UA: "Ukraine",
  PH: "Philippines",
  ID: "Indonesia",
  MY: "Malaysia",
  SG: "Singapore",
  TH: "Thailand",
  VN: "Vietnam",
  PK: "Pakistan",
  BD: "Bangladesh",
  HK: "Hong Kong",
  TW: "Taiwan",
};

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onChangeFormattedText: (text: string) => void;
  defaultCountry?: CountryCode;
  placeholder?: string;
  autoFocus?: boolean;
}

const PhoneInputComponent = ({
  value,
  onChangeText,
  onChangeFormattedText,
  defaultCountry = "US",
  placeholder = "Phone number",
  autoFocus = false,
}: PhoneInputProps) => {
  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(defaultCountry);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all countries with their data
  const allCountries = useMemo((): CountryData[] => {
    const countries = getCountries();
    return countries
      .map((code) => ({
        code,
        name: COUNTRY_NAMES[code] || code,
        dialCode: `+${getCountryCallingCode(code)}`,
        flag: getFlagEmoji(code),
      }))
      .sort((a, b) => {
        // Common countries first
        const aCommon = COMMON_COUNTRIES.indexOf(a.code);
        const bCommon = COMMON_COUNTRIES.indexOf(b.code);
        if (aCommon !== -1 && bCommon !== -1) return aCommon - bCommon;
        if (aCommon !== -1) return -1;
        if (bCommon !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
  }, []);

  // Filter countries by search
  const filteredCountries = useMemo(() => {
    if (!searchQuery) return allCountries;
    const query = searchQuery.toLowerCase();
    return allCountries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.dialCode.includes(query) ||
        c.code.toLowerCase().includes(query),
    );
  }, [allCountries, searchQuery]);

  const selectedCountryData = allCountries.find(
    (c) => c.code === selectedCountry,
  );

  // Handle phone input change
  const handlePhoneChange = (text: string) => {
    // Remove non-numeric characters for processing
    const cleaned = text.replace(/[^\d]/g, "");
    onChangeText(cleaned);

    // Format with country code
    const fullNumber = `${selectedCountryData?.dialCode}${cleaned}`;
    const phoneNumber = parsePhoneNumberFromString(fullNumber);

    if (phoneNumber) {
      onChangeFormattedText(phoneNumber.format("E.164"));
    } else {
      onChangeFormattedText(fullNumber);
    }
  };

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country.code);
    setShowPicker(false);
    setSearchQuery("");

    // Update formatted number with new country
    const fullNumber = `${country.dialCode}${value}`;
    const phoneNumber = parsePhoneNumberFromString(fullNumber);
    if (phoneNumber) {
      onChangeFormattedText(phoneNumber.format("E.164"));
    } else {
      onChangeFormattedText(fullNumber);
    }
  };

  return (
    <View style={styles.container}>
      {/* Country Picker Button */}
      <TouchableOpacity
        style={styles.countryButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.flag}>{selectedCountryData?.flag}</Text>
        <Text style={styles.dialCode}>{selectedCountryData?.dialCode}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {/* Phone Input */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handlePhoneChange}
        placeholder={placeholder}
        placeholderTextColor="#666"
        keyboardType="phone-pad"
        autoFocus={autoFocus}
      />

      {/* Country Picker Modal */}
      <Modal
        visible={showPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Search */}
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search countries..."
              placeholderTextColor="#666"
              autoFocus
            />

            {/* Country List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.countryItem,
                    pressed && styles.countryItemPressed,
                    item.code === selectedCountry && styles.countryItemSelected,
                  ]}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryDialCode}>{item.dialCode}</Text>
                </Pressable>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1A1A2E",
    borderRadius: 12,
    overflow: "hidden",
  },
  countryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: "#252540",
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  dialCode: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  arrow: {
    color: "#666",
    fontSize: 10,
    marginLeft: 2,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1A1A2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#252540",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    color: "#666",
    fontSize: 20,
    padding: 4,
  },
  searchInput: {
    backgroundColor: "#252540",
    margin: 16,
    padding: 12,
    borderRadius: 10,
    color: "#fff",
    fontSize: 16,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  countryItemPressed: {
    backgroundColor: "#252540",
  },
  countryItemSelected: {
    backgroundColor: "rgba(171, 139, 255, 0.2)",
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  countryDialCode: {
    color: "#666",
    fontSize: 14,
  },
});

export default PhoneInputComponent;
