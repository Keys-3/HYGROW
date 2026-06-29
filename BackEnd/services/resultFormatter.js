export function normalizeDiseaseResult(rawData) {
  let payload = rawData;

  if (rawData && typeof rawData === 'object' && Array.isArray(rawData.data)) {
    payload = rawData.data;
  }

  if (Array.isArray(payload)) {
    const first = payload[0];

    if (first && typeof first === 'object') {
      const disease =
        first.label ||
        first.class ||
        first.disease ||
        first.prediction ||
        first.name ||
        'Unknown disease';

      const confidence =
        typeof first.confidence === 'number'
          ? first.confidence
          : typeof first.score === 'number'
          ? first.score
          : 0;

      return {
        disease,
        confidence,
        severity:
          confidence >= 0.85
            ? 'high'
            : confidence >= 0.6
            ? 'moderate'
            : 'low',

        description: `Detected disease: ${disease}`,

        recommendations: [
          'Inspect affected leaves closely.',
          'Remove infected leaves if necessary.',
          'Monitor pH, humidity and airflow.',
        ],

        raw: rawData,
      };
    }

    if (typeof first === 'string') {
      return {
        disease: first,
        confidence: 0,
        severity: 'moderate',

        description: `Detected disease: ${first}`,

        recommendations: [
          'Inspect the plant.',
          'Compare symptoms.',
          'Treat only after confirming diagnosis.',
        ],

        raw: rawData,
      };
    }
  }

  return {
    disease: 'Unknown disease',
    confidence: 0,
    severity: 'moderate',

    description: 'Unexpected prediction format.',

    recommendations: [
      'Capture a clearer image.',
      'Ensure good lighting.',
    ],

    raw: rawData,
  };
}