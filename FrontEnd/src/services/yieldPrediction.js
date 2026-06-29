import { yieldPrediction as dummyYieldData } from '../data/dummyData';

export async function predictYield(data) {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyYieldData);
    }, 1500);
  });
}