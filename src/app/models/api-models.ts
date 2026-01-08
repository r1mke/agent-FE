export interface ApiModels {
}

export enum SampleStatus {
  Queued = 0,
  Processing = 1,
  Scored = 2,
  PendingReview = 3,
  Reviewed = 4,
  Training = 5,
  Error = 99
}

export interface Prediction {
  score: number;
  predictedLabel: string;
  decision: string;
}

export interface ImageSample {
  id: string;
  status: SampleStatus;
  label?: string;
  imagePath: string;
  fileName?: string;
  predictions?: Prediction[];
  prediction?: Prediction; // Za pending-review endpoint
}

export interface ReviewRequest {
  sampleId: string;
  isPollen: boolean;
}

export interface SystemStatus {
  modelStatus: string;
  modelPath: string;
  database: {
    totalSamples: number;
    goldSamples: number;
    pendingReview: number;
    queued: number;
  };
  training: {
    newGoldSinceLastTrain: number;
    retrainThreshold: number;
    willTrainOnNextCycle: boolean;
  };
}