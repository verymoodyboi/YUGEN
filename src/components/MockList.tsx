import data from "./MockData.json";

function List() {
  return (
    <ul>
      {data.map((item) => (
        <li key={item.first_name}>{item.last_name}</li>
      ))}
    </ul>
  );
}

export default List;
