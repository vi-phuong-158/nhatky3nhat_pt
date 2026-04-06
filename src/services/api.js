// src/services/api.js

const GAS_URL = import.meta.env.VITE_GAS_API_URL;

export const fetchEntries = async () => {
  if (!GAS_URL) {
    console.warn("Chưa cấu hình VITE_GAS_API_URL trong .env!");
    return [];
  }
  
  try {
    const response = await fetch(GAS_URL);
    if (!response.ok) throw new Error('Mạng bị lỗi. Vui lòng kiểm tra kết nối.');
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
    return [];
  }
};

export const submitEntry = async (entryData) => {
  if (!GAS_URL) {
    throw new Error("Chưa cấu hình API URL!");
  }

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        // Gửi dạng text/plain để tránh kích hoạt preflight request phức tạp từ Google Apps Script
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: JSON.stringify(entryData),
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Gửi dữ liệu thất bại.");
    }
    return result;
  } catch (error) {
    console.error("Lỗi gửi dữ liệu:", error);
    throw error;
  }
};
