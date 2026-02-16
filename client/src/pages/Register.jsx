import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const Register = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <SignUp signInUrl="/login" />
        </div>
    );
};

export default Register;
