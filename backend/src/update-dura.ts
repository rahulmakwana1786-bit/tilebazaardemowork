import { supabase } from './config/supabase.js';

async function updateDuraMatting() {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ image: 'dura--MATTING.png' })
      .ilike('name', '%dura%')
      .select();

    if (error) {
      console.error(error.message);
    } else {
      console.log("Updated DURA ELITE MATTING successfully:", data);
    }
  } catch (e) {
    console.error(e);
  }
}

updateDuraMatting();
