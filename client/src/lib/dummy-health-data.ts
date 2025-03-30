/**
 * Dummy health data module for demonstration purposes
 * This provides realistic looking health data for the application
 */

// Function to generate random number within a range
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to generate a date with a specific offset in days from today
function dateWithOffset(dayOffset: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return date;
}

// Generate a random timestamp for a given day with hour offset
function timestampForDay(dayOffset: number, hourOffset: number = 0): string {
  const date = dateWithOffset(dayOffset);
  date.setHours(hourOffset || randomInRange(6, 22), randomInRange(0, 59));
  return date.toISOString();
}

// Generate blood pressure data for a specified number of days
export function generateBloodPressureData(days: number = 7) {
  const data = [];
  for (let i = -days + 1; i <= 0; i++) {
    // Generate 2-3 readings per day
    const readingsPerDay = randomInRange(2, 3);
    for (let j = 0; j < readingsPerDay; j++) {
      // Create realistic blood pressure readings
      const systolic = randomInRange(110, 130);
      const diastolic = randomInRange(70, 85);
      
      data.push({
        timestamp: timestampForDay(i, 8 + j * 6), // Spread throughout the day
        systolic,
        diastolic,
        pulse: randomInRange(60, 80)
      });
    }
  }
  return data;
}

// Generate heart rate data for a specified number of days
export function generateHeartRateData(days: number = 7) {
  const data = [];
  for (let i = -days + 1; i <= 0; i++) {
    // Generate 5-10 readings per day for heart rate
    const readingsPerDay = randomInRange(5, 10);
    for (let j = 0; j < readingsPerDay; j++) {
      data.push({
        timestamp: timestampForDay(i),
        value: randomInRange(60, 100) // Resting heart rate range
      });
    }
  }
  return data;
}

// Generate step count data for a specified number of days
export function generateStepCountData(days: number = 7) {
  const data = [];
  for (let i = -days + 1; i <= 0; i++) {
    data.push({
      date: dateWithOffset(i).toISOString().split('T')[0],
      value: randomInRange(3000, 12000) // Daily step count
    });
  }
  return data;
}

// Generate weight data for a specified number of days
export function generateWeightData(days: number = 30, baseWeight: number = 70) {
  const data = [];
  // Weight doesn't usually change daily, so we'll generate fewer points
  const dataPoints = Math.min(days, 10);
  
  for (let i = 0; i < dataPoints; i++) {
    const dayOffset = -Math.floor((days / dataPoints) * i);
    
    // Small random fluctuations in weight
    const fluctuation = (Math.random() - 0.5) * 0.6;
    const weight = +(baseWeight + fluctuation).toFixed(1);
    
    data.push({
      date: dateWithOffset(dayOffset).toISOString().split('T')[0],
      value: weight
    });
  }
  
  // Sort chronologically
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Generate sleep data for a specified number of days
export function generateSleepData(days: number = 7) {
  const data = [];
  for (let i = -days + 1; i <= 0; i++) {
    const hoursSlept = randomInRange(5, 9) + Math.random();
    const sleepQuality = randomInRange(50, 95);
    const deepSleepPercentage = randomInRange(10, 30);
    const remSleepPercentage = randomInRange(15, 25);
    const lightSleepPercentage = 100 - deepSleepPercentage - remSleepPercentage;
    
    data.push({
      date: dateWithOffset(i).toISOString().split('T')[0],
      hoursSlept: +hoursSlept.toFixed(1),
      quality: sleepQuality,
      deepSleepMinutes: Math.round((hoursSlept * 60) * (deepSleepPercentage / 100)),
      remSleepMinutes: Math.round((hoursSlept * 60) * (remSleepPercentage / 100)),
      lightSleepMinutes: Math.round((hoursSlept * 60) * (lightSleepPercentage / 100))
    });
  }
  return data;
}

// Generate all health data types
export function generateAllHealthData() {
  return {
    bloodPressure: generateBloodPressureData(),
    heartRate: generateHeartRateData(),
    steps: generateStepCountData(),
    weight: generateWeightData(),
    sleep: generateSleepData()
  };
}

// Default export with all generated data
export default generateAllHealthData();