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

/** Rate limiter — giới hạn số lần gọi action trong khoảng thời gian */
const rateLimits = {};
const checkRateLimit = (action, maxCalls, windowMs) => {
  const now = Date.now();
  if (!rateLimits[action]) rateLimits[action] = [];
  rateLimits[action] = rateLimits[action].filter((t) => now - t < windowMs);
  if (rateLimits[action].length >= maxCalls) {
    throw new Error('Bạn thao tác quá nhanh, vui lòng thử lại sau.');
  }
  rateLimits[action].push(now);
};

/** Tải danh sách bài viết — HỖ TRỢ PHÂN TRANG & TÌM KIẾM SERVER-SIDE */
export const fetchEntries = async (page = 1, limit = 20, search = "") => {
  if (!GAS_URL) {
    console.warn("Chưa cấu hình VITE_GAS_API_URL trong .env!");
    return { data: [], totalCount: 0, hasMore: false };
  }
  
  try {
    const deviceId = getDeviceId();
    const url = `${GAS_URL}?deviceId=${encodeURIComponent(deviceId)}&page=${page}&limit=${limit}&q=${encodeURIComponent(search)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Mạng bị lỗi. Vui lòng kiểm tra kết nối.');
    const result = await response.json();
    return {
      data: result.data || [],
      totalCount: result.totalCount || 0,
      hasMore: result.hasMore ?? false,
    };
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
    throw error;
  }
};

/** Tải TẤT CẢ bài viết (cho trang Thống kê) — không phân trang */
export const fetchAllEntries = async () => {
  if (!GAS_URL) {
    console.warn("Chưa cấu hình VITE_GAS_API_URL trong .env!");
    return [];
  }
  
  try {
    const deviceId = getDeviceId();
    // Gửi limit rất lớn để lấy hết
    const url = `${GAS_URL}?deviceId=${encodeURIComponent(deviceId)}&page=1&limit=99999`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Mạng bị lỗi.');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Lỗi tải tất cả dữ liệu:", error);
    throw error;
  }
};

/** Tải danh sách ảnh từ album Google Drive */
export const fetchAlbumImages = async () => {
  if (!GAS_URL) {
    console.warn("Chưa cấu hình VITE_GAS_API_URL trong .env!");
    return [];
  }
  
  try {
    const url = `${GAS_URL}?action=album`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Mạng bị lỗi.');
    const result = await response.json();
    return result.images || [];
  } catch (error) {
    console.error("Lỗi tải album:", error);
    throw error;
  }
};

export const submitEntry = async (entryData) => {
  if (!GAS_URL) {
    throw new Error("Chưa cấu hình API URL!");
  }

  checkRateLimit('submit', 3, 60000); // max 3 bài / phút

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

  checkRateLimit('flower', 10, 10000); // max 10 lần tặng hoa / 10 giây

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

/**
 * Tải file (ảnh/video) trực tiếp lên Google Drive thông qua Resumable Upload
 * Giúp vượt quá giới hạn 50MB và tránh tràn RAM do Base64
 */
export const uploadFileToDrive = (file, onProgress) => {
  return new Promise(async (resolve, reject) => {
    if (!GAS_URL) return reject(new Error("Chưa cấu hình API URL!"));
    
    try {
      // 1. Lấy URL Resumable Upload từ GAS (truyền thêm Origin để khắc phục lỗi CORS)
      const currentOrigin = window.location.origin;
      const res = await fetch(`${GAS_URL}?action=getUploadUrl&fileName=${encodeURIComponent(file.name)}&mimeType=${encodeURIComponent(file.type)}&origin=${encodeURIComponent(currentOrigin)}`);
      const { uploadUrl, error } = await res.json();
      
      if (!uploadUrl) {
        return reject(new Error(error || "Không thể khởi tạo phiên tải lên (Upload Session)"));
      }

      // 2. Tải file trực tiếp lên URL do Google Drive cấp bằng XMLHttpRequest (để track %)
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          onProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const fileData = JSON.parse(xhr.responseText);
          resolve(fileData.id); // Trả về ID của file vừa upload
        } else {
          reject(new Error("Lỗi tải file lên server: " + xhr.statusText));
        }
      };

      xhr.onerror = () => {
        reject(new Error("Mạng bị lỗi hoặc bị ngắt kết nối khi đang tải."));
      };

      // Set đúng Content-Type của file
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
      
    } catch (e) {
      reject(e);
    }
  });
};
