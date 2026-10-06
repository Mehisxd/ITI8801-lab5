export interface NewExercise {
  name: string;
  repetitions: number;
}

export interface Exercise extends NewExercise {
  id: number;
}

export interface ErrorResponse {
  error: string;
}

export interface HealthResponse {
  status: "ok";
}