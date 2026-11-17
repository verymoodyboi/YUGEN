// src/types/qencode-api.d.ts
declare module "qencode-api" {
  interface QencodeClientOptions {
    key: string;
    endpoint?: string;
  }

  interface Destination {
    url: string;
    key: string;
    secret: string;
    permissions?: string;
  }

  interface StreamConfig {
    audio_bitrate?: string;
    size?: string;
    video_bitrate?: string;
    framerate?: string;
  }

  interface FormatConfig {
    output: string;
    refresh_playlist?: number;
    destination: Destination;
    stream: StreamConfig[];
  }

  interface TranscodingParams {
    source: string;
    encoder_version?: number;
    callback_url?: string;
    format: FormatConfig[];
  }

  interface JobStatus {
    status: string;
    percent?: number;
    error?: any;
    result?: any;
  }

  interface QencodeTask {
    taskToken: string;
    StartCustom(params: TranscodingParams): Promise<any>;
    GetStatus(): Promise<JobStatus>;
  }

  class QencodeApiClient {
    constructor(options: QencodeClientOptions);
    CreateTask(): Promise<QencodeTask>;
  }

  export = QencodeApiClient;
}
