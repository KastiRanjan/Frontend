import { Navigate, Route, Routes } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, method, resource, ...rest }: any) => {
    console.log('sad')
    // Check if the user has the required permission
    const hasPermission = false



    return (
        <Routes>
            <Route
                {...rest}
                element={hasPermission ? <Component /> : <Navigate to="/unauthorized" />}
            />
        </Routes>
    );
};

export default ProtectedRoute;
