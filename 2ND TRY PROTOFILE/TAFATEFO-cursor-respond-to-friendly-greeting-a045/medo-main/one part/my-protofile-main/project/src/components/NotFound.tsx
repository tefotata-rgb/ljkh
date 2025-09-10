import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="relative z-10 min-h-screen px-6 py-28">
      <div className="mx-auto max-w-6xl text-center">
        <h1 className="text-5xl font-extrabold text-white mb-4">404</h1>
        <p className="text-white/70 mb-8">The page you’re looking for doesn’t exist.</p>
        <Link to="/" className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold">Back to Home</Link>
      </div>
    </div>
  );
};

export default NotFound;

