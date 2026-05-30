import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const calculateDelivery = async (req: Request, res: Response) => {
  try {
    let { postcode, sqm, tileSize } = req.body;

    if (!sqm || sqm <= 0) {
      return res.status(400).json({ message: "Invalid SQM provided" });
    }

    // Calculation logic
    const boxes = Math.ceil(sqm / 1.44);
    const weight = boxes * 29; // 29kg per box
    
    // Tiles logic
    let tiles = 0;
    if (tileSize === '600x1200' || tileSize === '600X1200') {
      tiles = boxes * 2;
    } else {
      // Default 600x600 or others
      tiles = boxes * 4;
    }

    // Pallet calculation
    let fullPallets = 0;
    let fullLightPallets = 0;
    let halfPallets = 0;
    let quarterPallets = 0;
    let parcels = 0;

    let remainingWeight = weight;
    
    while (remainingWeight > 0) {
      if (remainingWeight >= 1000) {
        fullPallets++;
        remainingWeight -= 1000;
      } else if (remainingWeight > 750) {
        fullPallets++;
        remainingWeight -= remainingWeight;
      } else if (remainingWeight > 500) {
        fullLightPallets++;
        remainingWeight -= remainingWeight;
      } else if (remainingWeight > 250) {
        halfPallets++;
        remainingWeight -= remainingWeight;
      } else if (remainingWeight > 25) {
        quarterPallets++;
        remainingWeight -= remainingWeight;
      } else {
        parcels++;
        remainingWeight -= remainingWeight;
      }
    }

    let summaryPallets = [];
    if (fullPallets > 0) summaryPallets.push(`${fullPallets}x FULL`);
    if (fullLightPallets > 0) summaryPallets.push(`${fullLightPallets}x FULL LIGHT`);
    if (halfPallets > 0) summaryPallets.push(`${halfPallets}x HALF`);
    if (quarterPallets > 0) summaryPallets.push(`${quarterPallets}x QUARTER`);
    if (parcels > 0) summaryPallets.push(`${parcels}x PARCEL`);

    const palletType = summaryPallets.join(', ');

    // Delivery charge logic based on postcode
    let deliveryCharge = 0;
    
    if (sqm >= 500) {
      deliveryCharge = 0; // Free delivery for >= 500 SQM
    } else if (postcode) {
      // Clean postcode
      const cleanPostcode = postcode.trim().toUpperCase();
      const prefixMatch = cleanPostcode.match(/^[A-Z]+/);
      const prefix = prefixMatch ? prefixMatch[0] : '';

      // Find zone
      const { data: zones } = await supabase
        .from('delivery_zones')
        .select('*');

      let matchedZoneId = null;
      let rates: any[] = [];
      if (zones && zones.length > 0) {
        // Find zone containing the prefix
        for (const zone of zones) {
          if (zone.postcode_prefixes && zone.postcode_prefixes.includes(prefix)) {
            matchedZoneId = zone.id;
            break;
          }
        }
        
        // If no match found, fallback to first zone
        if (!matchedZoneId && zones[0]) {
            matchedZoneId = zones[0].id;
        }

        if (matchedZoneId) {
          const { data } = await supabase
            .from('delivery_rates')
            .select('*')
            .eq('zone_id', matchedZoneId);
          if (data) rates = data;
        }
      }

      // Calculate cost by summing up pallet costs with fallback defaults
      let totalCost = 0;
      
      const getRate = (type: string) => {
        const rate = rates.find(r => r.pallet_type === type);
        return rate ? Number(rate.price) : 0;
      };

      totalCost += fullPallets * (getRate('FULL') || 65);
      totalCost += fullLightPallets * (getRate('FULL LIGHT') || 55);
      totalCost += halfPallets * (getRate('HALF') || 45);
      totalCost += quarterPallets * (getRate('QUARTER') || 35);
      totalCost += parcels * (getRate('PARCEL') || 15);
      
      deliveryCharge = totalCost;
    }

    res.status(200).json({
      boxes,
      weight,
      tiles,
      palletType,
      deliveryCharge
    });

  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
