import * as THREE from 'three';
import UTIF from 'utif';

/**
 * Loads a TIFF image and converts it to a THREE.js Texture
 * @param url - Path to the TIFF file
 * @param onLoad - Callback when texture is loaded
 * @param onProgress - Optional progress callback
 * @param onError - Optional error callback
 * @returns THREE.Texture
 */
export function loadTiffTexture(
  url: string,
  onLoad?: (texture: THREE.Texture) => void,
  onProgress?: (event: ProgressEvent) => void,
  onError?: (error: Error) => void
): THREE.Texture {
  // Create a placeholder texture
  const texture = new THREE.Texture();

  // Fetch the TIFF file
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load TIFF: ${response.statusText}`);
      }
      return response.arrayBuffer();
    })
    .then((buffer) => {
      // Decode TIFF using UTIF
      const ifds = UTIF.decode(buffer);

      if (!ifds || ifds.length === 0) {
        throw new Error('Failed to decode TIFF - no image data found');
      }

      // Get the first image
      const firstImage = ifds[0];

      // Decode image to RGBA
      UTIF.decodeImage(buffer, firstImage);
      const rgba = UTIF.toRGBA8(firstImage);

      // Create canvas from RGBA data
      const canvas = document.createElement('canvas');
      canvas.width = firstImage.width;
      canvas.height = firstImage.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Create ImageData from RGBA array
      const imageData = new ImageData(
        new Uint8ClampedArray(rgba),
        firstImage.width,
        firstImage.height
      );

      ctx.putImageData(imageData, 0, 0);

      // Convert canvas to THREE.js texture
      texture.image = canvas;
      texture.needsUpdate = true;

      // Call onLoad callback if provided
      if (onLoad) {
        onLoad(texture);
      }
    })
    .catch((error) => {
      console.error('Error loading TIFF texture:', error);
      if (onError) {
        onError(error);
      }
    });

  return texture;
}

/**
 * Async version of loadTiffTexture
 * @param url - Path to the TIFF file
 * @returns Promise<THREE.Texture>
 */
export async function loadTiffTextureAsync(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    loadTiffTexture(
      url,
      (loadedTexture) => resolve(loadedTexture),
      undefined,
      (error) => reject(error)
    );
  });
}
