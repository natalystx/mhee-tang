import * as MediaLibrary from "expo-media-library";

export interface GalleryAlbum {
  id: string;
  title: string;
  assetCount: number;
}

export interface GalleryPhoto {
  id: string;
  uri: string;
  filename: string;
  creationTime: number;
  width: number;
  height: number;
  albumId?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  hasNextPage: boolean;
  endCursor?: string;
  totalCount: number;
}

export class GalleryService {
  private static instance: GalleryService;
  private permissionGranted = false;

  static getInstance(): GalleryService {
    if (!GalleryService.instance) {
      GalleryService.instance = new GalleryService();
    }
    return GalleryService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      this.permissionGranted = status === "granted";
      return this.permissionGranted;
    } catch (error) {
      console.error("Error requesting media library permissions:", error);
      return false;
    }
  }

  async getAlbums(): Promise<GalleryAlbum[]> {
    if (!this.permissionGranted) {
      throw new Error("Media library permission not granted");
    }

    try {
      const albums = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
      });

      return albums.map((album) => ({
        id: album.id,
        title: album.title,
        assetCount: album.assetCount,
      }));
    } catch (error) {
      console.error("Error fetching albums:", error);
      throw new Error("Failed to fetch albums");
    }
  }

  async getPhotosFromAlbums(
    albumIds: string[],
    page: number = 0,
    limit: number = 20,
    after?: string
  ): Promise<PaginatedResult<GalleryPhoto>> {
    if (!this.permissionGranted) {
      throw new Error("Media library permission not granted");
    }

    try {
      // Calculate date 3 months ago
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const allPhotos: GalleryPhoto[] = [];
      let totalCount = 0;

      // If no albums specified, get from all albums
      if (albumIds.length === 0) {
        const result = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.photo,
          first: limit,
          after: after,
          createdAfter: threeMonthsAgo.getTime(),
          sortBy: MediaLibrary.SortBy.creationTime,
        });

        const photos = result.assets.map((asset) => ({
          id: asset.id,
          uri: asset.uri,
          filename: asset.filename,
          creationTime: asset.creationTime,
          width: asset.width,
          height: asset.height,
        }));

        return {
          items: photos,
          hasNextPage: result.hasNextPage,
          endCursor: result.endCursor,
          totalCount: result.totalCount,
        };
      }

      // Get photos from specific albums
      for (const albumId of albumIds) {
        const result = await MediaLibrary.getAssetsAsync({
          album: albumId,
          mediaType: MediaLibrary.MediaType.photo,
          first: 1000, // Get more to filter by date
          createdAfter: threeMonthsAgo.getTime(),
          sortBy: MediaLibrary.SortBy.creationTime,
        });

        const albumPhotos = result.assets.map((asset) => ({
          id: asset.id,
          uri: asset.uri,
          filename: asset.filename,
          creationTime: asset.creationTime,
          width: asset.width,
          height: asset.height,
          albumId: albumId,
        }));

        allPhotos.push(...albumPhotos);
        totalCount += result.totalCount;
      }

      // Sort by creation time (newest first)
      allPhotos.sort((a, b) => b.creationTime - a.creationTime);

      // Apply pagination
      const startIndex = page * limit;
      const endIndex = startIndex + limit;
      const paginatedPhotos = allPhotos.slice(startIndex, endIndex);

      return {
        items: paginatedPhotos,
        hasNextPage: endIndex < allPhotos.length,
        totalCount: allPhotos.length,
      };
    } catch (error) {
      console.error("Error fetching photos:", error);
      throw new Error("Failed to fetch photos");
    }
  }

  async getPhotoInfo(assetId: string): Promise<MediaLibrary.AssetInfo | null> {
    if (!this.permissionGranted) {
      throw new Error("Media library permission not granted");
    }

    try {
      const assetInfo = await MediaLibrary.getAssetInfoAsync(assetId);
      return assetInfo;
    } catch (error) {
      console.error("Error fetching photo info:", error);
      return null;
    }
  }

  // Helper method to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Helper method to format date
  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }
}

export const galleryService = GalleryService.getInstance();
