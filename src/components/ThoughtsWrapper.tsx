import { useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Thoughts from './thoughts';

const ThoughtsWrapper = () => {
  const { filmId } = useParams();
  const { userId } = useAuth();

  return <Thoughts filmId={Number(filmId)} userId={userId} />;
};

export default ThoughtsWrapper;