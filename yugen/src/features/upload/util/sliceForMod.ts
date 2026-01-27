export const sliceFirst49MB = (file: File): File => {
  const MAX_BYTES = 45 * 1024 * 1024; 

  const slice = file.slice(
    0,
    Math.min(file.size, MAX_BYTES),
    file.type
  );

  return new File([slice], `moderation-${file.name}`, {
    type: file.type,
  });
};
