import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.body;
        if (!code) {
            res.status(400).json({ error: 'Coupon code is required' });
            return;
        }

        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('active', true)
            .single();

        if (error || !coupon) {
            res.status(404).json({ error: 'Invalid or expired coupon' });
            return;
        }

        res.json({ coupon });
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
};
