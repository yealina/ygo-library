import axios from 'axios';
const BASE_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

export async function keyword(param, value) {
  try {
    const response = await axios.get(BASE_URL, {
      params: { [param]: value }
    });
    return response.data?.data || [];
  } catch (error) {
    console.error(`Error ${param}=${value}:`, error.message);
    return [];
  }
}

export async function UID(id) {
  try {
    const response = await axios.get(BASE_URL, {
      params: { id }
    });
    return response.data?.data?.[0] || null;
  } catch (error) {
    console.error('Error ID:', error.message);
    return null;
  }
}
