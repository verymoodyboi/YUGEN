import ffmpeg, { FfprobeData } from 'fluent-ffmpeg';

/**
 * Transcodes a video to a given resolution and saves to outPath.
 * @param inputPath Path to the input video file
 * @param resolution Video width in pixels (height auto-scaled)
 * @param outPath Output file path
 */
export function transcodeToFile(
  inputPath: string,
  resolution: number | string,
  outPath: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .size(`${resolution}x?`)
      .format('mp4')
      .outputOptions('-movflags', 'frag_keyframe+empty_moov')
      .on('end', () => resolve(outPath))
      .on('error', (err) => reject(err))
      .save(outPath);
  });
}

/**
 * Extracts duration of a video file in "Xm Ys" format.
 * @param inputPath Path to the input video file
 */
export function getDuration(inputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata: FfprobeData) => {
      if (err) return reject(err);

      const durationSeconds = Math.floor(metadata.format?.duration ?? 0);
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      resolve(`${minutes}m ${seconds}s`);
    });
  });
}
