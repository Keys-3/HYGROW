export function normalizeResult(response) {
  const result = Array.isArray(response.data)
    ? response.data[0]
    : response.data;

  const label = result.label;

  const confidence =
    result.confidences?.find(
      c => c.label === label
    )?.confidence ?? 0;

  return {
    disease: label,
    confidence,
    severity:
      confidence > 0.9
        ? "high"
        : confidence > 0.7
        ? "moderate"
        : "low",
    description: `Detected ${label}`,
    recommendations: [
      "Inspect nearby plants.",
      "Remove infected leaves.",
      "Use recommended fungicide if necessary.",
      "Monitor plant over the next week.",
    ],
  };
}