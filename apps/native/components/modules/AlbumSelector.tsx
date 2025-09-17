import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { GalleryAlbum, galleryService } from "../../lib/gallery-service";

interface AlbumSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectionChange: (selectedAlbumIds: string[]) => void;
  selectedAlbumIds: string[];
}

const AlbumSelector: React.FC<AlbumSelectorProps> = ({
  visible,
  onClose,
  onSelectionChange,
  selectedAlbumIds,
}) => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [localSelectedIds, setLocalSelectedIds] =
    useState<string[]>(selectedAlbumIds);

  useEffect(() => {
    if (visible) {
      loadAlbums();
      setLocalSelectedIds(selectedAlbumIds);
    }
  }, [visible, selectedAlbumIds]);

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const hasPermission = await galleryService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos to select albums.",
          [{ text: "OK", onPress: onClose }]
        );
        return;
      }

      const albumList = await galleryService.getAlbums();
      // Filter out albums with no photos
      const albumsWithPhotos = albumList.filter(
        (album: GalleryAlbum) => album.assetCount > 0
      );
      setAlbums(albumsWithPhotos);
    } catch (error) {
      console.error("Error loading albums:", error);
      Alert.alert("Error", "Failed to load albums. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleAlbumSelection = (albumId: string) => {
    setLocalSelectedIds((prev) => {
      if (prev.includes(albumId)) {
        return prev.filter((id) => id !== albumId);
      } else {
        return [...prev, albumId];
      }
    });
  };

  const handleSelectAll = () => {
    if (localSelectedIds.length === albums.length) {
      setLocalSelectedIds([]);
    } else {
      setLocalSelectedIds(albums.map((album) => album.id));
    }
  };

  const handleApply = () => {
    onSelectionChange(localSelectedIds);
    onClose();
  };

  const renderAlbumItem = ({ item }: { item: GalleryAlbum }) => {
    const isSelected = localSelectedIds.includes(item.id);

    return (
      <TouchableOpacity
        style={[styles.albumItem, isSelected && styles.selectedAlbumItem]}
        onPress={() => toggleAlbumSelection(item.id)}
      >
        <View style={styles.albumInfo}>
          <Text style={[styles.albumTitle, isSelected && styles.selectedText]}>
            {item.title}
          </Text>
          <Text
            style={[styles.albumCount, isSelected && styles.selectedSubText]}
          >
            {item.assetCount} photos
          </Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Select Albums</Text>
          <TouchableOpacity onPress={handleApply}>
            <Text style={styles.applyButton}>Apply</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handleSelectAll}
            style={styles.selectAllButton}
          >
            <Text style={styles.selectAllText}>
              {localSelectedIds.length === albums.length
                ? "Deselect All"
                : "Select All"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.selectionCount}>
            {localSelectedIds.length} of {albums.length} selected
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading albums...</Text>
          </View>
        ) : (
          <FlatList
            data={albums}
            keyExtractor={(item) => item.id}
            renderItem={renderAlbumItem}
            style={styles.albumsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  cancelButton: {
    fontSize: 16,
    color: "#666",
  },
  applyButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
  },
  selectAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#e9ecef",
    borderRadius: 6,
  },
  selectAllText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  selectionCount: {
    fontSize: 14,
    color: "#6c757d",
  },
  albumsList: {
    flex: 1,
  },
  albumItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  selectedAlbumItem: {
    backgroundColor: "#e3f2fd",
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 2,
  },
  albumCount: {
    fontSize: 14,
    color: "#666",
  },
  selectedText: {
    color: "#1976d2",
  },
  selectedSubText: {
    color: "#1976d2",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AlbumSelector;
