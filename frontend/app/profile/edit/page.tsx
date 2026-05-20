"use client";
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export default function EditProfile() {
  const { user, loading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Initialize state with all available fields from user record
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    address_line1: user?.address_line1 || '',
    address_line2: user?.address_line2 || '',
    city: user?.city || '',
    postcode: user?.postcode || '',
    country: user?.country || 'United Kingdom',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(result)) {
      router.push('/profile');
    }
  };

  return (
    <section className='max-w-full bg-white'>
    <div className="max-w-2xl mx-auto py-20 px-6 mt-10">
      <header className="mb-10 pt-16 text-center md:text-left">
        <h2 className="text-3xl font-serif text-[#4a2c2a] mb-2">Edit Shipping & Profile</h2>
        <p className="text-[10px] text-[#4a2c2a] uppercase tracking-widest opacity-50">Update your primary delivery information</p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Full Name */}
        <div className="md:col-span-2">
          <label className="text-[10px] font-bold uppercase text-[#4a2c2a] opacity-50 block mb-1">Full Name</label>
          <input 
            name="full_name"
            type="text"
            className="w-full border-b text-[#4a2c2a] font-bold border-gray-200 py-3 outline-none placeholder:text-[#4a2c2a]/30 focus:border-[#4a2c2a] text-sm transition-colors"
            value={formData.full_name}
            placeholder="Full Name"
            onChange={handleChange}
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="text-[10px] font-bold text-[#4a2c2a] uppercase opacity-50 block mb-1">Phone Number</label>
          <input 
            name="phone_number"
            type="tel"
            className="w-full border-b text-[#4a2c2a] font-bold border-gray-200 py-3 outline-none placeholder:text-[#4a2c2a]/30 focus:border-[#4a2c2a] text-sm transition-colors"
            value={formData.phone_number}
            placeholder="Phone Number"
            onChange={handleChange}
          />
        </div>

        {/* Postcode */}
        <div>
          <label className="text-[10px] font-bold text-[#4a2c2a] uppercase opacity-50 block mb-1">Postcode (UK)</label>
          <input 
            name="postcode"
            type="text"
            className="w-full border-b text-[#4a2c2a] font-bold border-gray-200 py-3 outline-none placeholder:text-[#4a2c2a]/30 focus:border-[#4a2c2a] text-sm uppercase transition-colors"
            value={formData.postcode}
            placeholder="Postcode"
            onChange={(e) => setFormData({...formData, postcode: e.target.value.toUpperCase()})}
          />
        </div>

        {/* Address Line 1 */}
        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-[#4a2c2a] uppercase opacity-50 block mb-1">Address Line 1</label>
          <input 
            name="address_line1"
            type="text"
            className="w-full border-b text-[#4a2c2a] font-bold border-gray-200 py-3 outline-none placeholder:text-[#4a2c2a]/30 focus:border-[#4a2c2a] text-sm transition-colors"
            value={formData.address_line1}
            placeholder="Address Line 1"
            onChange={handleChange}
          />
        </div>

        {/* Address Line 2 */}
        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-[#4a2c2a] uppercase opacity-50 block mb-1">Address Line 2 (Optional)</label>
          <input 
            name="address_line2"
            type="text"
            className="w-full border-b text-[#4a2c2a] font-bold border-gray-200 py-3 outline-none placeholder:text-[#4a2c2a]/30 focus:border-[#4a2c2a] text-sm transition-colors"
            value={formData.address_line2}
            placeholder="Address Line 2"
            onChange={handleChange}
          />
        </div>

        {/* City */}
        <div>
          <label className="text-[10px] font-bold text-[#4a2c2a] uppercase opacity-50 block mb-1">City / Town</label>
          <input 
            name="city"
            type="text"
            className="w-full border-b text-[#4a2c2a] font-bold border-gray-200 py-3 outline-none placeholder:text-[#4a2c2a]/30 focus:border-[#4a2c2a] text-sm transition-colors"
            value={formData.city}
            placeholder="City / Town"
            onChange={handleChange}
          />
        </div>

        {/* Country */}
        <div>
          <label className="text-[10px] font-bold text-[#4a2c2a] uppercase opacity-50 block mb-1">Country</label>
          <input 
            name="country"
            type="text"
            className="w-full border-b text-[#4a2c2a] font-bold border-gray-200 py-3 outline-none placeholder:text-[#4a2c2a]/30 focus:border-[#4a2c2a] text-sm transition-colors"
            value={formData.country}
            placeholder="Country"
            onChange={handleChange}
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit"
          disabled={loading}
          className="md:col-span-2 bg-[#4a2c2a] cursor-pointer text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] mt-8 hover:bg-[#3d2422] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating Profile...' : 'Save All Changes'}
        </button>
        
        <button 
          type="button"
          onClick={() => router.back()}
          className="md:col-span-2 text-[10px] cursor-pointer uppercase font-bold text-gray-400 hover:text-black transition-colors py-2"
        >
          Cancel and Return
        </button>
      </form>
    </div>
    </section>
  );
}