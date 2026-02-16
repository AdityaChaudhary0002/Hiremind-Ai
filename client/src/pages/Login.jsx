import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const Login = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <SignIn signUpUrl="/register" />
        </div>
    );
};

export default Login;
