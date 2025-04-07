import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-gothic text-blood">404</h1>
        <p className="text-2xl text-light-darker">The page you seek lies in darkness...</p>
        <Link 
          to="/" 
          className="btn btn-primary inline-block"
        >
          Return to Safety
        </Link>
      </div>
    </div>
  );
}