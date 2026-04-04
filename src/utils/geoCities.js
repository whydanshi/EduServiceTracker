function norm(s) {
  return (s || '').trim().toLowerCase()
}

export const CITY_COORDS = {
  // Maharashtra
  mumbai:            { lat: 19.076, lon: 72.8777, state: 'Maharashtra' },
  pune:              { lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
  nagpur:            { lat: 21.1458, lon: 79.0882, state: 'Maharashtra' },
  thane:             { lat: 19.2183, lon: 72.9781, state: 'Maharashtra' },
  nashik:            { lat: 19.9975, lon: 73.7898, state: 'Maharashtra' },
  aurangabad:        { lat: 19.8762, lon: 75.3433, state: 'Maharashtra' },
  // Delhi
  delhi:             { lat: 28.6139, lon: 77.209, state: 'Delhi' },
  'new delhi':       { lat: 28.6139, lon: 77.209, state: 'Delhi' },
  // Karnataka
  bangalore:         { lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  bengaluru:         { lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
  mysore:            { lat: 12.2958, lon: 76.6394, state: 'Karnataka' },
  mysuru:            { lat: 12.2958, lon: 76.6394, state: 'Karnataka' },
  mangalore:         { lat: 12.9141, lon: 74.856, state: 'Karnataka' },
  hubli:             { lat: 15.3647, lon: 75.124, state: 'Karnataka' },
  // Uttar Pradesh
  lucknow:           { lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh' },
  noida:             { lat: 28.5355, lon: 77.391, state: 'Uttar Pradesh' },
  kanpur:            { lat: 26.4499, lon: 80.3319, state: 'Uttar Pradesh' },
  varanasi:          { lat: 25.3176, lon: 82.9739, state: 'Uttar Pradesh' },
  agra:              { lat: 27.1767, lon: 78.0081, state: 'Uttar Pradesh' },
  // Rajasthan
  jaipur:            { lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
  udaipur:           { lat: 24.5854, lon: 73.7125, state: 'Rajasthan' },
  jodhpur:           { lat: 26.2389, lon: 73.0243, state: 'Rajasthan' },
  kota:              { lat: 25.2138, lon: 75.8648, state: 'Rajasthan' },
  // Gujarat
  ahmedabad:         { lat: 23.0225, lon: 72.5714, state: 'Gujarat' },
  surat:             { lat: 21.1702, lon: 72.8311, state: 'Gujarat' },
  vadodara:          { lat: 22.3072, lon: 73.1812, state: 'Gujarat' },
  rajkot:            { lat: 22.3039, lon: 70.8022, state: 'Gujarat' },
  // Tamil Nadu
  chennai:           { lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
  coimbatore:        { lat: 11.0168, lon: 76.9558, state: 'Tamil Nadu' },
  madurai:           { lat: 9.9252, lon: 78.1198, state: 'Tamil Nadu' },
  // Telangana
  hyderabad:         { lat: 17.385, lon: 78.4867, state: 'Telangana' },
  warangal:          { lat: 17.9784, lon: 79.5941, state: 'Telangana' },
  // West Bengal
  kolkata:           { lat: 22.5726, lon: 88.3639, state: 'West Bengal' },
  howrah:            { lat: 22.5958, lon: 88.2636, state: 'West Bengal' },
  siliguri:          { lat: 26.7271, lon: 88.3953, state: 'West Bengal' },
  // Madhya Pradesh
  indore:            { lat: 22.7196, lon: 75.8577, state: 'Madhya Pradesh' },
  bhopal:            { lat: 23.2599, lon: 77.4126, state: 'Madhya Pradesh' },
  jabalpur:          { lat: 23.1815, lon: 79.9864, state: 'Madhya Pradesh' },
  // Haryana
  gurgaon:           { lat: 28.4595, lon: 77.0266, state: 'Haryana' },
  gurugram:          { lat: 28.4595, lon: 77.0266, state: 'Haryana' },
  faridabad:         { lat: 28.4089, lon: 77.3178, state: 'Haryana' },
  // Kerala
  kochi:             { lat: 9.9312, lon: 76.2673, state: 'Kerala' },
  trivandrum:        { lat: 8.5241, lon: 76.9366, state: 'Kerala' },
  thiruvananthapuram: { lat: 8.5241, lon: 76.9366, state: 'Kerala' },
  kozhikode:         { lat: 11.2588, lon: 75.7804, state: 'Kerala' },
  // Chandigarh (UT)
  chandigarh:        { lat: 30.7333, lon: 76.7794, state: 'Chandigarh' },
  // Punjab
  ludhiana:          { lat: 30.901, lon: 75.8573, state: 'Punjab' },
  amritsar:          { lat: 31.634, lon: 74.8723, state: 'Punjab' },
  // Bihar
  patna:             { lat: 25.5941, lon: 85.1376, state: 'Bihar' },
  gaya:              { lat: 24.7955, lon: 84.9994, state: 'Bihar' },
  // Odisha
  bhubaneswar:       { lat: 20.2961, lon: 85.8245, state: 'Odisha' },
  // Assam
  guwahati:          { lat: 26.1445, lon: 91.7362, state: 'Assam' },
  // Jharkhand
  ranchi:            { lat: 23.3441, lon: 85.3096, state: 'Jharkhand' },
  jamshedpur:        { lat: 22.8046, lon: 86.2029, state: 'Jharkhand' },
}

export function normalizeCity(city) {
  return norm(city)
}

export function getCityCoord(city) {
  const key = norm(city)
  return key ? CITY_COORDS[key] : null
}

export function getCityState(city) {
  const key = norm(city)
  return CITY_COORDS[key]?.state || 'Other'
}

