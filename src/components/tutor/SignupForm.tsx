import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupTutor, verifyOtp, resendOtp } from '../../services/tutorAuth';
import * as yup from 'yup'
import { ErrorMessage, Field, Form, Formik } from 'formik';
import ImageUpload from '../../utils/Cloudinary';
import Tutor from '../../interfaces/tutor';
import { toast } from 'react-toastify';




const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Tutor>({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',

  });

  const [otp, setOtp] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(30);
  const [error, setError] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string>('');


  const validationSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    mobile: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
      .required('Mobile number is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Must contain one number')
      .matches(/[@$!%*&]/, 'Must contain at least one special character')
      .required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  });


  const handleDocumentUpload = async (file: File | undefined) => {
    try {
      if (file) {
        const uploadedUrl = await ImageUpload(file);
        console.log('Uploaded document URL:', uploadedUrl);
        setDocumentUrl(uploadedUrl);
      }
    } catch (error) {
      console.error('Document upload error:', error);
    }
  };



  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError(null);

  //   const { name, email, mobile, password, confirmPassword } = formData;



  //   try {
  //     await signupTutor({ name, email, mobile, password });
  //     setIsOtpSent(true);
  //     setTimer(30); 
  //     alert('OTP sent to your email. Please verify.');
  //   } catch (err: any) {
  //     setError(err.message);
  //   }
  // };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    
      const { email } = formData;
      if (!email) {
        setError("Email is missing.");
      return; 
      };
     try{
      await verifyOtp(email, otp);
      toast.success('OTP verified successfully!');
      navigate('/tutor/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleResendOtp = async () => {
    try {
      const { email } = formData;
      if (!email) throw new Error('Email is missing.');

      await resendOtp(email);
      setTimer(30); 
      toast.success('OTP resent successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Timer logic using useEffect
  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;

    if (isOtpSent && timer > 0) {
        interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
    }

    if (timer === 0) {
        clearInterval(interval);
    }

    return () => {
        clearInterval(interval);
    };
}, [isOtpSent, timer]);


 

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl flex shadow-lg rounded-lg overflow-hidden">
        {/* Left Image Section */}
        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://i.pinimg.com/736x/97/db/6f/97db6fe74aef67b999eb1e6046ea616d.jpg')",
          }}
        ></div>

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Create Account</h2>
          <p className="text-gray-600 text-center mb-6">Bridge the gap between learners and fluency—start teaching now!</p>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          {!isOtpSent ? (
            <Formik
              initialValues={{ name: '', email: '', mobile: '', password: '', confirmPassword: '', documents: '' }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  const formDatas = {
                    ...values,
                    documents: documentUrl,
                  }
                  await signupTutor(formDatas);
                  setIsOtpSent(true);
                  alert('OTP sent to your email. Please verify.');
                } catch (err: any) {
                  setError(err.message);
                }
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, handleChange }) => (
                <Form>
                  {['name', 'email', 'mobile', 'password', 'confirmPassword'].map((field) => (
                    <div className="mb-4" key={field}>
                      <label className="block text-gray-700 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                      <Field
                        type={field === 'password' || field === 'confirmPassword' ? 'password' : 'text'}
                        name={field}
                        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter your ${field}`}
                        value={formData[field as keyof Tutor]} 
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFormData((prevState) => ({
                            ...prevState,
                            [field]: e.target.value, 
                          }));
                          handleChange(e); 
                        }}
                      />
                      <ErrorMessage name={field} component="div" className="text-red-500 text-sm" />
                    </div>
                  ))}

                  <div>
                    <label className="block text-gray-700">Upload Document</label>
                    <input
                      type="file"
                      accept=".pdf, .docx, .txt"
                      onChange={(e) => handleDocumentUpload(e.target.files?.[0])}
                    />

                    {documentUrl && (
                      <p className="text-green-500 mt-2">
                        Document Uploaded Successfully! <a href={documentUrl} target="_blank" rel="noopener noreferrer"></a>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                  >
                    Sign Up
                  </button>
                </Form>
              )}
            </Formik>

          ) : (
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter OTP"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
              >
                Verify OTP
              </button>
            </form>
          )}
          {isOtpSent && timer > 0 && (
            <p className="mt-2 text-center text-gray-600">Resend OTP in: {timer}s</p>
          )}

          {isOtpSent && timer === 0 && (
            <button
              onClick={handleResendOtp}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded mt-4 hover:bg-gray-600 transition"
            >
              Resend OTP
            </button>
          )}

          

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{' '}
            <span
              className="text-blue-500 cursor-pointer hover:underline"
              onClick={() => navigate('/tutor/login')}
            >
              Log in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
