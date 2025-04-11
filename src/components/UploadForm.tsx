import "../App.css";

function UploadForm() {
  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form submitted!");
  };
  const HandleChange = (event: React.FormEvent<HTMLFormElement>) => {
    console.log("Form submitted!");
  };

  return (
    <div>
      <form onSubmit={handleUpload}>
        <label>Film:</label>
        <input type="file" />
        <br />
        <label>Title:</label>
        <input type="text" />
        <br />
        <label>Description:</label>
        <input type="text" />
        <br />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default UploadForm;
