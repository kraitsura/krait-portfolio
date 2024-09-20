// utils/getFileNames.ts
export async function getFileNames(folderPath: string): Promise<string[]> {
  const url = `/api/getFileNames?folderPath=${encodeURIComponent(folderPath)}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch file names: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.files;
  } catch (error) {
    console.error('Error fetching file names:', error);
    return [];
  }
}