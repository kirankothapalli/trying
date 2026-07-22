import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import { forgotPassword, selectAuth } from '../store/slices/authSlice';
import { ErrorMessage } from '../components/ui/LoadingScreen';

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector(selectAuth);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const res = await dispatch(forgotPassword(data.email));
    if (!res.error) setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card border border-white/10 p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-slate-400 text-sm mb-6">If that email exists in our system, we've sent a password reset link.</p>
              <Link to="/login" className="btn-primary">Back to Login</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 mx-auto flex items-center justify-center mb-4">
                  <FiMail className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
                <p className="text-slate-400 mt-1 text-sm">Enter your email to receive a reset link</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <ErrorMessage message={error} />
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      {...register('email', { required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                      type="email" placeholder="you@example.com"
                      className={`input pl-11 ${errors.email ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full">
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-center text-slate-400 text-sm mt-6">
                <Link to="/login" className="text-primary hover:underline">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
