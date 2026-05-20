import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import fs from 'fs/promises';
import path from 'path';

const FALLBACK_FILE = path.join(process.cwd(), 'inquiries_fallback.json');

async function appendFallback(inquiry: any) {
  try {
    let arr: any[] = [];
    try {
      const raw = await fs.readFile(FALLBACK_FILE, 'utf8');
      arr = JSON.parse(raw || '[]');
    } catch (e) {
      arr = [];
    }
    arr.unshift(inquiry);
    await fs.writeFile(FALLBACK_FILE, JSON.stringify(arr, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write fallback inquiry file:', e);
  }
}

export const createInquiry = async (req: Request, res: Response) => {
  const { user_name, company_name, user_email, inquiry_type, area_sqm, message } = req.body;

  if (!user_name || !user_email || !inquiry_type) {
    return res.status(400).json({ message: 'Name, email, and inquiry type are required.' });
  }

  const payload = {
    contact_name: user_name,
    company_name,
    email: user_email,
    inquiry_type,
    area_sqm: area_sqm ? Number(area_sqm) : null,
    message,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('project_inquiries')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error (falling back):', error.message || error);
      await appendFallback(payload);
      return res.status(201).json({ message: 'Inquiry received (fallback)', inquiry: payload });
    }

    return res.status(201).json({ message: 'Inquiry received successfully', inquiry: data });
  } catch (err: any) {
    console.error('Inquiry creation error (falling back):', err.message || err);
    try {
      await appendFallback(payload);
      return res.status(201).json({ message: 'Inquiry received (fallback)', inquiry: payload });
    } catch (fallbackErr: any) {
      return res.status(500).json({ message: fallbackErr.message || 'Failed to save inquiry' });
    }
  }
};

export const getAllInquiries = async (req: Request, res: Response) => {
  let supabaseInquiries: any[] = [];
  try {
    const { data, error } = await supabase
      .from('project_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch inquiries error:', error.message || error);
    } else if (data) {
      // Normalize columns if they are named differently or missing on the remote schema
      supabaseInquiries = data.map((item: any) => ({
        id: item.id,
        contact_name: item.contact_name || item.name || 'Anonymous',
        company_name: item.company_name || null,
        email: item.email || 'no-email@example.com',
        inquiry_type: item.inquiry_type || 'General Inquiry',
        area_sqm: item.area_sqm || null,
        message: item.message || null,
        created_at: item.created_at,
      }));
    }
  } catch (err: any) {
    console.error('Supabase fetch inquiries thrown error:', err.message || err);
  }

  // Load fallback inquiries
  let fallbackInquiries: any[] = [];
  try {
    const raw = await fs.readFile(FALLBACK_FILE, 'utf8');
    fallbackInquiries = JSON.parse(raw || '[]');
  } catch (e) {
    // If fallback file doesn't exist yet, it's fine
  }

  // Combine both, sort by created_at descending, and assign fallback IDs if missing
  const allInquiries = [...supabaseInquiries, ...fallbackInquiries]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((inquiry, index) => ({
      ...inquiry,
      id: inquiry.id || `inquiry-fallback-${index}`
    }));

  res.status(200).json(allInquiries);
};

