import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useViewModel } from "./useViewModel";
import ImageGallery from "../../components/modules/ImageGallery";
import AlbumSelector from "../../components/modules/AlbumSelector";

const DashboardScreenComponent = () => {
  const {
    photos,
    loading,
    refreshing,
    hasNextPage,
    totalCount,
    permissionGranted,
    showAlbumSelector,
    selectedAlbumIds,
    handleAlbumSelectionChange,
    handleLoadMore,
    handleRefresh,
    handlePhotoPress,
    openAlbumSelector,
    closeAlbumSelector,
    initializeGallery,
    getSelectedAlbumsText,
  } = useViewModel();

  if (!permissionGranted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Gallery Access Required</Text>
          <Text style={styles.permissionMessage}>
            Please allow access to your photos to view your gallery from the
            last 3 months.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={initializeGallery}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Gallery</Text>
          <Text style={styles.subtitle}>
            {totalCount} photos from last 3 months
          </Text>
        </View>
        <TouchableOpacity
          style={styles.albumButton}
          onPress={openAlbumSelector}
        >
          <Text style={styles.albumButtonText}>{getSelectedAlbumsText()}</Text>
          <Text style={styles.albumButtonIcon}>select</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.galleryContainer}>
        <ImageGallery
          photos={photos}
          loading={loading}
          hasNextPage={hasNextPage}
          onLoadMore={handleLoadMore}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onPhotoPress={handlePhotoPress}
        />
        <Text>Gallery Placeholder</Text>
      </View>

      <AlbumSelector
        visible={showAlbumSelector}
        onClose={closeAlbumSelector}
        onSelectionChange={handleAlbumSelectionChange}
        selectedAlbumIds={selectedAlbumIds}
      />
    </View>
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
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    width: "100%",
    height: 20,
    marginTop: 2,
  },
  albumButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    width: 150,
    height: 36,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    maxWidth: 150,
  },
  albumButtonText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    marginRight: 4,
    flex: 1,
  },
  albumButtonIcon: {
    fontSize: 12,
    color: "#666",
  },
  galleryContainer: {
    width: "100%",
    height: 500,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: "#007AFF",
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DashboardScreenComponent;
