import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-gothic text-red-500">404</h1>
        <p className="text-2xl text-gray-300">The page you seek lies in darkness...</p>
        <Link 
          to="/" 
          className="bg-red-900 hover:bg-red-800 text-white font-bold py-2 px-4 rounded inline-block"
        >
          Return to Safety
        </Link>
      </div>
    </div>
  );
}