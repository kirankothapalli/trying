import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiPlus, FiTrash2 } from 'react-icons/fi';
import { updateProfile, selectUser } from '../store/slices/authSlice';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPass, setShowPass] = useState(false);
  const [showAddAddr, setShowAddAddr] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profErrors } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone || '' },
  });
  const { register: regPass, handleSubmit: handlePass, reset: resetPass, watch, formState: { errors: passErrors } } = useForm();
  const { register: regAddr, handleSubmit: handleAddr, reset: resetAddr, formState: { errors: addrErrors } } = useForm();
  const newPassword = watch('newPassword');

  const onProfileSubmit = (data) => dispatch(updateProfile(data));

  const onPasswordSubmit = async (data) => {
    try {
      await api.put('/users/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed!');
      resetPass();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const onAddressSubmit = async (data) => {
    try {
      await api.post('/users/addresses', data);
      toast.success('Address added!');
      setShowAddAddr(false);
      resetAddr();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deleteAddress = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      toast.success('Address deleted');
    } catch (err) {
      toast.error('Failed');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'password', label: 'Password' },
    { id: 'addresses', label: 'Addresses' },
  ];

  return (
    <div className="pt-16 min-h-screen">
      <div className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-slate-400 text-sm">{user?.email}</p>
              {user?.role === 'admin' && <span className="badge-primary mt-1">Admin</span>}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-dark-lighter rounded-xl p-1 mb-8">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
              <h2 className="font-semibold text-white mb-5">Personal Information</h2>
              <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input {...regProfile('name', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })}
                      className={`input pl-11 ${profErrors.name ? 'input-error' : ''}`} />
                  </div>
                  {profErrors.name && <p className="text-red-400 text-xs mt-1">{profErrors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email (read-only)</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={user?.email} readOnly className="input pl-11 opacity-60 cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input {...regProfile('phone')} className="input pl-11" placeholder="+91 9999999999" />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Save Changes</button>
              </form>
            </motion.div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
              <h2 className="font-semibold text-white mb-5">Change Password</h2>
              <form onSubmit={handlePass(onPasswordSubmit)} className="space-y-5">
                {['currentPassword', 'newPassword', 'confirmPassword'].map((field, i) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {['Current Password', 'New Password', 'Confirm New Password'][i]}
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        {...regPass(field, {
                          required: 'Required',
                          ...(field === 'newPassword' && {
                            minLength: { value: 8, message: 'Min 8 chars' },
                            pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Uppercase, lowercase & number required' },
                          }),
                          ...(field === 'confirmPassword' && {
                            validate: (v) => v === newPassword || 'Passwords do not match',
                          }),
                        })}
                        type={showPass ? 'text' : 'password'}
                        className={`input pl-11 pr-11 ${passErrors[field] ? 'input-error' : ''}`}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                        {showPass ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passErrors[field] && <p className="text-red-400 text-xs mt-1">{passErrors[field].message}</p>}
                  </div>
                ))}
                <button type="submit" className="btn-primary">Update Password</button>
              </form>
            </motion.div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {user?.addresses?.length === 0 && !showAddAddr && (
                <div className="card p-8 text-center text-slate-400">No addresses saved yet.</div>
              )}
              {user?.addresses?.map((addr) => (
                <div key={addr._id} className="card p-5 flex justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">{addr.label}</span>
                      {addr.isDefault && <span className="badge-primary text-xs">Default</span>}
                    </div>
                    <p className="text-sm text-slate-400">{addr.street}, {addr.city}, {addr.state} {addr.zipCode}</p>
                    <p className="text-sm text-slate-400">{addr.country}</p>
                  </div>
                  <button onClick={() => deleteAddress(addr._id)} className="btn-icon text-red-400 hover:bg-red-500/10">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {showAddAddr ? (
                <div className="card p-6">
                  <h3 className="font-semibold text-white mb-4">Add New Address</h3>
                  <form onSubmit={handleAddr(onAddressSubmit)} className="grid sm:grid-cols-2 gap-4">
                    {[['label', 'Label (e.g. Home)'], ['street', 'Street *'], ['city', 'City *'], ['state', 'State *'], ['zipCode', 'ZIP Code *'], ['country', 'Country *']].map(([name, label]) => (
                      <div key={name} className={name === 'street' ? 'sm:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
                        <input {...regAddr(name, { required: name !== 'label' ? 'Required' : false })}
                          defaultValue={name === 'country' ? 'India' : name === 'label' ? 'Home' : ''}
                          className={`input ${addrErrors[name] ? 'input-error' : ''}`} />
                        {addrErrors[name] && <p className="text-red-400 text-xs mt-1">{addrErrors[name].message}</p>}
                      </div>
                    ))}
                    <div className="sm:col-span-2 flex gap-3">
                      <button type="submit" className="btn-primary">Save Address</button>
                      <button type="button" onClick={() => setShowAddAddr(false)} className="btn-secondary">Cancel</button>
                    </div>
                  </form>
                </div>
              ) : (
                <button onClick={() => setShowAddAddr(true)} className="btn-secondary flex items-center gap-2 w-full justify-center py-3">
                  <FiPlus className="w-4 h-4" /> Add New Address
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
