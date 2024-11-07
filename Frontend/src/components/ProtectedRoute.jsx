import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, isAdminRoute }) => {
    const { isLoggedIn, user } = useAuth();
    const location = useLocation();

    // Debugging
    console.log('isLoggedIn:', isLoggedIn);
    console.log('userRole:', user?.role);

    // Handle loading state
    if (user === null) {
        return <div>Loading...</div>; // Or a loader component
    }

    // Redirect logic
    if (!isLoggedIn || (isAdminRoute && user?.role !== 'ADMIN')) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    isAdminRoute: PropTypes.bool, // Prop to check if the route is admin protected
};

export default ProtectedRoute;