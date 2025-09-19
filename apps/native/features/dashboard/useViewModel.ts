import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import {
  galleryService,
  GalleryPhoto,
  GalleryAlbum,
} from "../../lib/gallery-service";
import { apiClient } from "@/lib/api";

interface GalleryState {
  photos: GalleryPhoto[];
  albums: GalleryAlbum[];
  selectedAlbumIds: string[];
  currentPage: number;
  loading: boolean;
  refreshing: boolean;
  hasNextPage: boolean;
  totalCount: number;
  permissionGranted: boolean;
}

export const useViewModel = () => {
  const [state, setState] = useState<GalleryState>({
    photos: [],
    albums: [],
    selectedAlbumIds: [],
    currentPage: 0,
    loading: false,
    refreshing: false,
    hasNextPage: false,
    totalCount: 0,
    permissionGranted: false,
  });

  const [showAlbumSelector, setShowAlbumSelector] = useState(false);

  // Initialize and request permissions
  useEffect(() => {
    initializeGallery();
  }, []);

  const initializeGallery = async () => {
    try {
      const hasPermission = await galleryService.requestPermissions();

      setState((prev) => ({ ...prev, permissionGranted: hasPermission }));

      if (hasPermission) {
        await loadAlbums();
        await loadPhotos([], 0, true); // Load all photos initially
      } else {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos to view your gallery.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Try Again", onPress: initializeGallery },
          ]
        );
      }
    } catch (error) {
      console.error("Error initializing gallery:", error);
      Alert.alert("Error", "Failed to initialize gallery. Please try again.");
    }
  };

  const loadAlbums = async () => {
    try {
      const albumList = await galleryService.getAlbums();

      setState((prev) => ({ ...prev, albums: albumList }));
    } catch (error) {
      console.error("Error loading albums:", error);
      Alert.alert("Error", "Failed to load albums.");
    }
  };

  const loadPhotos = async (
    albumIds: string[] = state.selectedAlbumIds,
    page: number = 0,
    replace: boolean = false
  ) => {
    if (!state.permissionGranted) return;

    setState((prev) => ({
      ...prev,
      loading: page === 0 && replace,
      refreshing: page === 0 && !replace,
    }));

    try {
      const result = await galleryService.getPhotosFromAlbums(
        albumIds,
        page,
        20
      );

      const uriToFile = async (
        photo: GalleryPhoto
      ): Promise<{
        uri: string;
        name: string;
        type: string;
        size: number;
        lastModified: number;
      }> => {
        try {
          console.log("Processing photo:", photo.id, photo.uri); // Debug log

          // For gallery photos, we can use the metadata we already have
          // and optionally get additional info using the asset ID
          let assetInfo: any = null;
          try {
            assetInfo = await galleryService.getPhotoInfo(photo.id);
          } catch (infoError) {
            console.warn("Could not get detailed asset info:", infoError);
          }

          // Determine MIME type based on file extension
          const getImageMimeType = (filename: string): string => {
            const ext = filename.toLowerCase().split(".").pop();
            switch (ext) {
              case "jpg":
              case "jpeg":
                return "image/jpeg";
              case "png":
                return "image/png";
              case "gif":
                return "image/gif";
              case "webp":
                return "image/webp";
              case "heic":
                return "image/heic";
              default:
                return "image/jpeg";
            }
          };

          const filename = assetInfo?.filename || photo.filename || "image.jpg";
          const mimeType = getImageMimeType(filename);

          return {
            uri: photo.uri,
            name: filename,
            type: mimeType,
            size: (assetInfo as any)?.fileSize || 0,
            lastModified: photo.creationTime || Date.now(),
          };
        } catch (error) {
          console.error("Error converting photo to file info:", error);

          // Fallback: return basic info from the photo object
          const getImageMimeType = (filename: string): string => {
            const ext = filename.toLowerCase().split(".").pop();
            switch (ext) {
              case "jpg":
              case "jpeg":
                return "image/jpeg";
              case "png":
                return "image/png";
              case "gif":
                return "image/gif";
              case "webp":
                return "image/webp";
              case "heic":
                return "image/heic";
              default:
                return "image/jpeg";
            }
          };

          return {
            uri: photo.uri,
            name: photo.filename || "image.jpg",
            type: getImageMimeType(photo.filename || "image.jpg"),
            size: 0,
            lastModified: photo.creationTime || Date.now(),
          };
        }
      };

      const photosWithFileData = await Promise.all(
        result.items.map(async (photo) => {
          const fileData = await uriToFile(photo);
          return { ...photo, fileData };
        })
      );

      // Convert photosWithFileData to File objects
      const files: globalThis.File[] = await Promise.all(
        photosWithFileData.map(async (photo) => {
          try {
            let blob: Blob;

            // Check if this is a special URI that needs MediaLibrary handling
            if (
              photo.uri.startsWith("ph://") ||
              photo.uri.startsWith("content://")
            ) {
              console.log("Fetching via localUri for:", photo.uri); // Debug log
              // For iOS ph:// URIs and Android content:// URIs, get localUri
              const assetInfo = await galleryService.getPhotoInfo(photo.id);
              if (assetInfo?.localUri) {
                const response = await fetch(assetInfo.localUri);
                if (!response.ok) {
                  throw new Error(
                    `Failed to fetch from localUri: ${response.status}`
                  );
                }
                blob = await response.blob();
              } else {
                throw new Error("No localUri available");
              }
            } else {
              // For regular file:// URIs, use fetch directly
              const response = await fetch(photo.uri);
              if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status}`);
              }
              blob = await response.blob();
            }

            // Create File object from blob
            const file = new globalThis.File([blob], photo.fileData.name, {
              type: photo.fileData.type,
              lastModified: photo.fileData.lastModified,
            });
            return file;
          } catch (error) {
            console.warn("Failed to convert photo to File:", error);
            // Return a placeholder File for failed conversions
            return new globalThis.File([], photo.fileData.name, {
              type: photo.fileData.type,
              lastModified: photo.fileData.lastModified,
            });
          }
        })
      );

      const fileToBase64 = async (file: globalThis.File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1]; // Remove data:*/*;base64, prefix
            resolve(base64);
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(file);
        });
      };

      const filesInBase64 = await Promise.all(
        files.map(async (file) => {
          try {
            const base64 = await fileToBase64(file);
            return base64;
          } catch (error) {
            console.warn("Failed to convert file to base64:", error);
            return null;
          }
        })
      );

      try {
        console.log("Uploading files:", files.length); // Debug log
        const res = await apiClient.v1.api.transactions.post({
          images: filesInBase64
            .filter((file) => file !== null)
            .map((file) => ({ image: file }) as any),
        });
        console.log("Upload response:", res); // Debug log
      } catch (error) {
        console.error("Photo upload failed:", error);
      }

      setState((prev) => ({
        ...prev,
        photos: replace ? result.items : [...prev.photos, ...result.items],
        hasNextPage: result.hasNextPage,
        totalCount: result.totalCount,
        currentPage: page,
        loading: false,
        refreshing: false,
      }));
    } catch (error) {
      console.error("Error loading photos:", error);
      setState((prev) => ({ ...prev, loading: false, refreshing: false }));
      Alert.alert("Error", "Failed to load photos. Please try again.");
    }
  };

  const handleAlbumSelectionChange = useCallback((selectedIds: string[]) => {
    setState((prev) => ({ ...prev, selectedAlbumIds: selectedIds }));
    loadPhotos(selectedIds, 0, true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (state.hasNextPage && !state.loading) {
      loadPhotos(state.selectedAlbumIds, state.currentPage + 1, false);
    }
  }, [
    state.hasNextPage,
    state.loading,
    state.selectedAlbumIds,
    state.currentPage,
  ]);

  const handleRefresh = useCallback(() => {
    loadPhotos(state.selectedAlbumIds, 0, true);
  }, [state.selectedAlbumIds]);

  const handlePhotoPress = useCallback((photo: GalleryPhoto, index: number) => {
    Alert.alert(
      "Photo Details",
      `File: ${photo.filename}\nDate: ${new Date(photo.creationTime).toLocaleString()}\nSize: ${photo.width}x${photo.height}`,
      [{ text: "OK" }]
    );
  }, []);

  const openAlbumSelector = useCallback(() => {
    setShowAlbumSelector(true);
  }, []);

  const closeAlbumSelector = useCallback(() => {
    setShowAlbumSelector(false);
  }, []);

  const getSelectedAlbumsText = useCallback(() => {
    if (state.selectedAlbumIds.length === 0) {
      return "All Albums";
    } else if (state.selectedAlbumIds.length === 1) {
      const album = state.albums.find(
        (a) => a.id === state.selectedAlbumIds[0]
      );
      return album?.title || "1 Album";
    } else {
      return `${state.selectedAlbumIds.length} Albums`;
    }
  }, [state.selectedAlbumIds, state.albums]);

  // Separate function for uploading photos (can be called when needed)
  const uploadPhotos = useCallback(async (photos: GalleryPhoto[]) => {
    try {
      const { apiClient } = await import("@/lib/api");

      const files = await Promise.all(
        photos.map(async (photo) => {
          try {
            let blob: Blob;

            // Check if this is a special URI that needs MediaLibrary handling
            if (
              photo.uri.startsWith("ph://") ||
              photo.uri.startsWith("content://")
            ) {
              // For iOS ph:// URIs and Android content:// URIs, get localUri
              const assetInfo = await galleryService.getPhotoInfo(photo.id);
              if (assetInfo?.localUri) {
                const response = await fetch(assetInfo.localUri);
                if (!response.ok) {
                  throw new Error(
                    `Failed to fetch from localUri: ${response.status}`
                  );
                }
                blob = await response.blob();
              } else {
                throw new Error("No localUri available");
              }
            } else {
              // For regular file:// URIs, use fetch directly
              const response = await fetch(photo.uri);
              if (!response.ok) {
                throw new Error(`Failed to fetch file: ${response.status}`);
              }
              blob = await response.blob();
            }

            const webFile = new globalThis.File(
              [blob],
              photo.filename || "image.jpg",
              {
                type: "image/jpeg", // You might want to detect this properly
                lastModified: photo.creationTime || Date.now(),
              }
            );
            return { image: webFile };
          } catch (error) {
            console.warn("Failed to convert file for upload:", error);
            return null;
          }
        })
      );

      const validFiles = files.filter(
        (file): file is { image: globalThis.File } => file !== null
      );

      // if (validFiles.length > 0) {
      //   await apiClient.v1.api.transactions.post({
      //     images: validFiles,
      //   });
      //   console.log(`Successfully uploaded ${validFiles.length} photos`);
      // }
    } catch (error) {
      console.error("Photo upload failed:", error);
      throw error;
    }
  }, []);

  return {
    // State
    photos: state.photos,
    albums: state.albums,
    selectedAlbumIds: state.selectedAlbumIds,
    loading: state.loading,
    refreshing: state.refreshing,
    hasNextPage: state.hasNextPage,
    totalCount: state.totalCount,
    permissionGranted: state.permissionGranted,
    showAlbumSelector,

    // Actions
    handleAlbumSelectionChange,
    handleLoadMore,
    handleRefresh,
    handlePhotoPress,
    openAlbumSelector,
    closeAlbumSelector,
    initializeGallery,
    uploadPhotos,

    // Computed
    getSelectedAlbumsText,
  };
};
