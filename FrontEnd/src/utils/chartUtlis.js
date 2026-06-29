export function getMin(data) {
  return Math.min(...data);
}

export function getMax(data) {
  return Math.max(...data);
}

export function getAverage(data) {
  if (!data.length) return 0;

  return (
    data.reduce((a, b) => a + b, 0) /
    data.length
  );
}

export function normalizePoints(
  values,
  width,
  height,
  padding = 20
) {
  if (!values.length) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);

  const range = max - min || 1;

  return values.map((value, index) => {
    const x =
      padding +
      (index * (width - padding * 2)) /
        (values.length - 1 || 1);

    const y =
      height -
      padding -
      ((value - min) / range) *
        (height - padding * 2);

    return { x, y };
  });
}

export function pointsToPath(points) {
  if (!points.length) return "";

  return points.reduce((path, point, i) => {
    return (
      path +
      `${i === 0 ? "M" : " L"}${point.x},${point.y}`
    );
  }, "");
}