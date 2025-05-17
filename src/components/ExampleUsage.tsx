import { useAuth } from './AuthContext';

const ExampleUsage: React.FC = () => {
  const { user, userId, username, isAuthenticated, accessToken } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in to view this content</div>;
  }

  return (
    <div>
      {/* Access user ID */}
      <p>User ID: {userId}</p>
      
      {/* Access username */}
      <p>Username: {username}</p>
      
      {/* Check if user is authenticated */}
      <p>Authentication status: {isAuthenticated ? 'Logged in' : 'Not logged in'}</p>
      
      {/* Access full user object if needed */}
      <p>Profile picture path: {user?.pfp}</p>
      
      {/* Access token if needed for API calls */}
      <p>Has valid token: {accessToken ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default ExampleUsage; 