const GAS_URL = import.meta.env.VITE_GAS_API_URL;

/** Lấy hoặc tạo Device ID duy nhất cho mỗi thiết bị */
const getDeviceId = () => {
  let id = localStorage.getItem('nk3n_device_id');
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('nk3n_device_id', id);
  }
  return id;
};

export const fetchEntries = async () => {
  if (!GAS_URL) {
    console.warn("Chưa cấu hình VITE_GAS_API_URL trong .env!");
    return [];
  }
  
  try {
    const deviceId = getDeviceId();
    const url = `${GAS_URL}?deviceId=${encodeURIComponent(deviceId)}`;
    const response = await fetch(url);
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

export const sendFlower = async (articleId) => {
  if (!GAS_URL) throw new Error("Chưa cấu hình API URL!");

  const deviceId = getDeviceId();

  try {
    // Gửi request lên GAS và AWAIT response (server là source of truth)
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      redirect: 'follow',
      body: JSON.stringify({
        action: 'tangHoa',
        articleId: String(articleId),
        deviceId: deviceId,
      }),
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        toggled: result.toggled,         // 'added' hoặc 'removed' từ server
        flowerCount: result.flowerCount, // Số hoa chính xác từ Sheet TangHoa
      };
    } else {
      throw new Error(result.error || 'Lỗi tặng hoa');
    }
  } catch (err) {
    console.error('Lỗi tặng hoa:', err);
    throw err;
  }
};
