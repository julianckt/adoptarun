export type AdoptionStatus = 'committed' | 'completed' | 'walk_in';
export type RunLogSource = 'strava_oauth' | 'gpx_upload';

export interface CounterRecord {
  id: string;
  current_val: number;
}

export interface AdoptionRecord {
  seq_num: number;
  adopter_id: string;
  runner_first_name: string;
  runner_last_name: string;
  email: string;
  route_slug: string;
  charity_slug: string;
  commitment_days: number;
  target_date: string;
  target_hkd: number | null;
  animal_name: string;
  status: AdoptionStatus;
  confirmation_email_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ElevationPoint {
  distance_km: number;
  elevation_m: number;
  lat: number;
  lng: number;
}

export interface RunLogRecord {
  run_id: string;
  adoption_ref_id: string;
  runner_name: string;
  route_slug: string;
  distance_km: number;
  moving_time_seconds: number;
  elevation_gain_m: number;
  avg_pace_min_per_km: number;
  fundraised_hkd: number | null;
  polyline_json: string;
  elevation_profile_json: string;
  source: RunLogSource;
  strava_activity_id: string | null;
  verified_at: string;
  created_at: string;
}

export interface CreateAdoptionInput {
  runnerFirstName: string;
  runnerLastName: string;
  email: string;
  routeSlug?: string;
  charitySlug: string;
  commitmentDays?: number;
  targetDate: string;
  targetHkd?: number | null;
  animalName: string;
  customJump?: number; // Optional jump offset for testing
}

export interface CreateWalkInInput {
  runnerFirstName: string;
  runnerLastName: string;
  email: string;
  charitySlug: string;
  animalName: string;
  customJump?: number;
}

export interface CreateRunLogInput {
  runId?: string; // Optional: if omitted, automatically generated via auto-suffix resolver
  adoptionRefId: string;
  runnerName: string;
  routeSlug?: string;
  distanceKm: number;
  movingTimeSeconds: number;
  elevationGainM: number;
  avgPaceMinPerKm: number;
  fundraisedHkd?: number | null;
  polylineJson: string;
  elevationProfileJson: string | ElevationPoint[];
  source?: RunLogSource;
  stravaActivityId?: string | null;
}
