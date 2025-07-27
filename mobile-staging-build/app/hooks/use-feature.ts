import { useState, useEffect } from "react";

/**
 * Hook for checking if a feature is enabled
 * @param featureName The name of the feature to check
 * @returns boolean indicating if the feature is enabled
 */
export function useFeature(featureName: string): boolean {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Check if feature is enabled
    const checkFeature = async () => {
      try {
        const response = await fetch(`/api/features/check?name=${featureName}`);
        if (response.ok) {
          const data = await response.json();
          setIsEnabled(data.enabled);
        }
      } catch (error) {
        console.error(`Error checking feature ${featureName}:`, error);
        // Default to false if there's an error
        setIsEnabled(false);
      }
    };

    checkFeature();
  }, [featureName]);

  return isEnabled;
}
