import { ScrollView, Pressable, Text, View, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { LOCATIONS } from '../constants/locations';

interface Props {
  activeCity: string | null;
  activeNeighborhood: string | null;
  onCityChange: (city: string | null) => void;
  onNeighborhoodChange: (neighborhood: string | null) => void;
}

export function LocationPicker({
  activeCity,
  activeNeighborhood,
  onCityChange,
  onNeighborhoodChange,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const selectedCity = LOCATIONS.find((c) => c.name === activeCity);
  const hasNeighborhoods = selectedCity?.neighborhoods && selectedCity.neighborhoods.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityRow}
      >
        <Pressable
          style={[styles.chip, !activeCity && styles.chipActive]}
          onPress={() => {
            onCityChange(null);
            onNeighborhoodChange(null);
          }}
        >
          <Ionicons
            name="location-outline"
            size={14}
            color={!activeCity ? Colors.white : Colors.gray}
          />
          <Text style={[styles.chipText, !activeCity && styles.chipTextActive]}>All Areas</Text>
        </Pressable>
        {LOCATIONS.map((city) => {
          const isActive = activeCity === city.name;
          return (
            <Pressable
              key={city.slug}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => {
                if (isActive) {
                  onCityChange(null);
                  onNeighborhoodChange(null);
                } else {
                  onCityChange(city.name);
                  onNeighborhoodChange(null);
                }
              }}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {city.name}
              </Text>
              {city.neighborhoods && city.neighborhoods.length > 0 && isActive ? (
                <Ionicons name="chevron-down" size={14} color={Colors.white} />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      {hasNeighborhoods && activeCity ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.neighborhoodRow}
        >
          <Pressable
            style={[styles.smallChip, !activeNeighborhood && styles.smallChipActive]}
            onPress={() => onNeighborhoodChange(null)}
          >
            <Text
              style={[styles.smallChipText, !activeNeighborhood && styles.smallChipTextActive]}
            >
              All {activeCity}
            </Text>
          </Pressable>
          {selectedCity!.neighborhoods!.map((nb) => {
            const isActive = activeNeighborhood === nb.name;
            return (
              <Pressable
                key={nb.slug}
                style={[styles.smallChip, isActive && styles.smallChipActive]}
                onPress={() => onNeighborhoodChange(isActive ? null : nb.name)}
              >
                <Text style={[styles.smallChipText, isActive && styles.smallChipTextActive]}>
                  {nb.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  cityRow: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
    flexDirection: 'row',
  },
  neighborhoodRow: {
    paddingHorizontal: 12,
    paddingBottom: 6,
    gap: 6,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  chipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.dark,
  },
  chipTextActive: {
    color: Colors.white,
  },
  smallChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  smallChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryLight,
  },
  smallChipText: {
    fontSize: 12,
    color: Colors.gray,
  },
  smallChipTextActive: {
    color: Colors.white,
    fontWeight: '500',
  },
});
