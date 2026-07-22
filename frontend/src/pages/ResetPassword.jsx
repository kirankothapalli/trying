import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { resetPassword, selectAuth } from '../store/slices/authSlice';
import { ErrorMessage } from '../components/ui/LoadingScreen';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(selectAuth);
  const [showPass, setShowPass] = useState(false);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    const res = await dispatch(resetPassword({ token, password: data.password }));
    if (!res.error) {
      setDone(true);
      toast.success('Password reset! Please login.');
      setTimeout(() => navigate('/login'), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card border border-white/10 p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password reset!</h2>
              <p className="text-slate-400 text-sm">Redirecting to login...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 mx-auto flex items-center justify-center mb-4">
                  <FiLock className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-white">Reset password</h1>
                <p className="text-slate-400 mt-1 text-sm">Choose a strong new password</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <ErrorMessage message={error} />
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      {...register('password', {
                        required: 'Password required',
                        minLength: { value: 8, message: 'Min 8 characters' },
                        pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase, lowercase & number' },
                      })}
                      type={showPass ? 'text' : 'password'} placeholder="New password"
                      className={`input pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      {...register('confirmPassword', {
                        required: 'Please confirm',
                        validate: (v) => v === password || 'Passwords do not match',
                      })}
                      type={showPass ? 'text' : 'password'} placeholder="Confirm new password"
                      className={`input pl-11 ${errors.confirmPassword ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full">
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
