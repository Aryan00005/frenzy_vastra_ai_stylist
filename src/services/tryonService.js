import { supabase } from './supabaseClient';

// Function to create a unique session ID
const createSessionId = () => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${randomString}`;
};

export const tryonService = {
  async getProducts(category = null) {
    let query = supabase
      .from('tryon_products')
      .select(`
        *,
        variations:tryon_product_variations(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return data;
  },

  async getProductById(productId) {
    const { data, error } = await supabase
      .from('tryon_products')
      .select(`
        *,
        variations:tryon_product_variations(*)
      `)
      .eq('id', productId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    return data;
  },

  async createSession(inputType, deviceType, inputImageUrl = null) {
    const sessionToken = generateSessionToken();

    const { data, error } = await supabase
      .from('tryon_sessions')
      .insert({
        session_token: sessionToken,
        input_type: inputType,
        device_type: deviceType,
        input_image_url: inputImageUrl,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }

    return data;
  },

  async endSession(sessionId) {
    const { error } = await supabase
      .from('tryon_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  },

  async recordInteraction(sessionId, productId, variationId = null, duration = 0) {
    const { data, error } = await supabase
      .from('tryon_interactions')
      .insert({
        session_id: sessionId,
        product_id: productId,
        variation_id: variationId,
        duration_seconds: duration,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording interaction:', error);
      throw error;
    }

    return data;
  },

  async updateInteraction(interactionId, updates) {
    const { error } = await supabase
      .from('tryon_interactions')
      .update(updates)
      .eq('id', interactionId);

    if (error) {
      console.error('Error updating interaction:', error);
      throw error;
    }
  },

  async uploadScreenshot(sessionId, imageBlob) {
    const fileName = `screenshots/${sessionId}_${Date.now()}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tryon-screenshots')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Error uploading screenshot:', uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('tryon-screenshots')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }
};
