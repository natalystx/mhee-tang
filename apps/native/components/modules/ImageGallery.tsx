import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { GalleryPhoto } from "../../lib/gallery-service";

interface ImageGalleryProps {
  photos: GalleryPhoto[];
  loading: boolean;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  onPhotoPress?: (photo: GalleryPhoto, index: number) => void;
}

const { width: screenWidth } = Dimensions.get("window");
const numColumns = 3;
const imageSpacing = 2;
const imageSize = (screenWidth - (numColumns + 1) * imageSpacing) / numColumns;

const ImageGallery: React.FC<ImageGalleryProps> = ({
  photos,
  loading,
  hasNextPage,
  onLoadMore,
  onRefresh,
  refreshing,
  onPhotoPress,
}) => {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !loading && !loadingMore) {
      setLoadingMore(true);
      try {
        await onLoadMore();
      } catch (error) {
        console.error("Error loading more photos:", error);
        Alert.alert("Error", "Failed to load more photos. Please try again.");
      } finally {
        setLoadingMore(false);
      }
    }
  }, [hasNextPage, loading, loadingMore, onLoadMore]);

  const renderPhoto = ({
    item,
    index,
  }: {
    item: GalleryPhoto;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={() => onPhotoPress?.(item, index)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.photo}
          contentFit="cover"
          transition={200}
          placeholder={{ blurhash: "L6Pj42WB2yk8pyo0adR*.7kCMdnj" }}
          cachePolicy="memory-disk"
        />
        <View style={styles.photoOverlay}>
          <Text style={styles.photoDate}>
            {new Date(item.creationTime).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore && !loading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>
          {loading ? "Loading photos..." : "Loading more..."}
        </Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Photos Found</Text>
        <Text style={styles.emptySubtitle}>
          No photos from the last 3 months in the selected albums.
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const keyExtractor = useCallback((item: GalleryPhoto) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: imageSize,
      offset: Math.floor(index / numColumns) * imageSize,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        getItemLayout={getItemLayout}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        windowSize={10}
        initialNumToRender={20}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: imageSpacing,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: imageSpacing,
  },
  photoContainer: {
    width: imageSize,
    height: imageSize,
    marginRight: imageSpacing,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  photoDate: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ImageGallery;
