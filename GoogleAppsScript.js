// ==========================================
// CẤU HÌNH — Chỉnh sửa 2 giá trị này cho khớp
// ==========================================
const SPREADSHEET_ID = '1Dz-GAh4czM2bF-p8KsOAYnS5kYa4EI_5rkzfCDwq5p0';
const SHEET_NAME = 'DuLieu'; // Tên tab sheet (kiểm tra chính xác hoa/thường/dấu cách)

/** Hàm tiện ích mở sheet — thử theo tên, nếu không khớp thì lấy sheet đầu tiên */
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (sheet) return sheet;
  return ss.getSheets()[0];
}

/** Lấy hoặc tạo sheet 'TangHoa' để lưu dữ liệu tặng hoa */
function getFlowerSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName('TangHoa');
  if (!sheet) {
    sheet = ss.insertSheet('TangHoa');
    sheet.appendRow(['ArticleId', 'DeviceId', 'Timestamp']);
  }
  return sheet;
}

/** Đếm số hoa cho từng bài viết, trả về object { articleId: count } */
function countAllFlowers() {
  var sheet = getFlowerSheet();
  var data = sheet.getDataRange().getValues();
  var counts = {};
  for (var i = 1; i < data.length; i++) {
    var artId = String(data[i][0]);
    if (artId) counts[artId] = (counts[artId] || 0) + 1;
  }
  return counts;
}

/** Lấy danh sách articleId mà 1 device đã tặng hoa */
function getDeviceFlowers(deviceId) {
  var sheet = getFlowerSheet();
  var data = sheet.getDataRange().getValues();
  var flowered = [];
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === deviceId) {
      flowered.push(String(data[i][0]));
    }
  }
  return flowered;
}

/** Chuyển giá trị ô ngày tháng từ Sheets thành chuỗi ISO an toàn */
function safeDate(val) {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

/** Chuyển giá trị ô bất kỳ thành chuỗi an toàn (tránh lỗi serialization) */
function safeStr(val) {
  if (val === null || val === undefined) return '';
  return String(val);
}

// ==========================================
// 1. CƠ CHẾ ROUTING & TRẢ VỀ GIAO DIỆN
// ==========================================
function doGet(e) {
  // Nếu URL có đuôi ?view=admin thì trả về trang Admin.html
  if (e.parameter.view === 'admin') {
    var template = HtmlService.createTemplateFromFile('Admin');
    return template.evaluate()
      .setTitle('Admin - Nhật ký 3 Nhất')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // ─── API: Album ảnh từ Google Drive folder ───
  if (e.parameter.action === 'album') {
    try {
      var folderId = '14wkyhsViNaEKUunwuzwcLGVUWTROGRvg';
      var folder = DriveApp.getFolderById(folderId);
      var files = folder.getFiles();
      var images = [];
      while (files.hasNext()) {
        var file = files.next();
        var mimeType = file.getMimeType();
        if (mimeType.indexOf('image/') === 0) {
          images.push({
            id: file.getId(),
            name: file.getName(),
            url: 'https://lh3.googleusercontent.com/d/' + file.getId(),
            thumb: 'https://lh3.googleusercontent.com/d/' + file.getId() + '=w400',
            date: file.getDateCreated().toISOString(),
          });
        }
      }
      // Sắp xếp mới nhất trước
      images.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
      return ContentService.createTextOutput(JSON.stringify({ images: images, total: images.length }))
        .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ images: [], total: 0, error: err.message }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  // API trả JSON cho frontend React (Vite) — HỖ TRỢ PHÂN TRANG
  try {
    const sheet = getSheet();
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ data: [], totalCount: 0, error: 'Sheet not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Đếm hoa 1 lần cho tất cả bài
    var flowerCounts = countAllFlowers();
    // Lấy danh sách bài mà device đã tặng hoa (nếu có deviceId trong query)
    var deviceId = e.parameter.deviceId || '';
    var deviceFlowered = deviceId ? getDeviceFlowers(deviceId) : [];
    
    // Tham số tìm kiếm
    var search = (e.parameter.q || "").toLowerCase().trim();

    const data = sheet.getDataRange().getValues();
    const allApproved = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const trangThai = safeStr(row[7]) || 'Chờ duyệt';

      if (trangThai === 'Đã duyệt') {
        // Nội dung để tìm kiếm: Họ tên, đơn vị, tiêu đề, nội dung
        var searchContent = (safeStr(row[1]) + safeStr(row[2]) + safeStr(row[3]) + safeStr(row[5])).toLowerCase();
        
        if (!search || searchContent.indexOf(search) !== -1) {
          var artId = String(i + 1);
          allApproved.push({
            id: i + 1,
            thoiGian: safeDate(row[0]),
            hoTen: safeStr(row[1]),
            donVi: safeStr(row[2]),
            tieuDe: safeStr(row[3]),
            tieuChi: safeStr(row[4]),
            noiDung: safeStr(row[5]),
            linkAnh: safeStr(row[6]),
            flowerCount: flowerCounts[artId] || 0,
            hasFlowered: deviceFlowered.indexOf(artId) !== -1,
          });
        }
      }
    }

    // Sắp xếp theo thời gian mới nhất
    allApproved.sort((a, b) => new Date(b.thoiGian || 0) - new Date(a.thoiGian || 0));

    var totalCount = allApproved.length;

    // Phân trang: page (1-indexed), limit (mặc định 20)
    var page = parseInt(e.parameter.page) || 1;
    var limit = parseInt(e.parameter.limit) || 20;
    if (page < 1) page = 1;
    if (limit < 1) limit = 20;
    if (limit > 10000) limit = 10000; // Cho phép lấy nhiều (thống kê)

    var startIdx = (page - 1) * limit;
    var entries = allApproved.slice(startIdx, startIdx + limit);

    return ContentService.createTextOutput(JSON.stringify({
      data: entries,
      totalCount: totalCount,
      page: page,
      limit: limit,
      hasMore: startIdx + limit < totalCount
    }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ data: [], totalCount: 0, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// 2. HÀM NHẬN BÀI VIẾT MỚI TỪ FRONTEND
// ==========================================
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    // ─── XỬ LÝ TẶNG HOA ───
    if (body.action === 'tangHoa') {
      var articleId = String(body.articleId);
      var deviceId = String(body.deviceId);
      if (!articleId || !deviceId) throw new Error('Thiếu articleId hoặc deviceId');

      var fSheet = getFlowerSheet();
      var fData = fSheet.getDataRange().getValues();

      // Kiểm tra đã tặng chưa
      var existingRow = -1;
      for (var i = 1; i < fData.length; i++) {
        if (String(fData[i][0]) === articleId && String(fData[i][1]) === deviceId) {
          existingRow = i + 1;
          break;
        }
      }

      if (existingRow > 0) {
        // Đã tặng → hủy hoa (xóa dòng)
        fSheet.deleteRow(existingRow);
        // Đếm lại
        var newCount = 0;
        var updatedData = fSheet.getDataRange().getValues();
        for (var j = 1; j < updatedData.length; j++) {
          if (String(updatedData[j][0]) === articleId) newCount++;
        }
        return ContentService.createTextOutput(JSON.stringify({
          success: true, toggled: 'removed', flowerCount: newCount
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        // Chưa tặng → thêm hoa
        fSheet.appendRow([articleId, deviceId, new Date()]);
        var newCount2 = 0;
        var updatedData2 = fSheet.getDataRange().getValues();
        for (var k = 1; k < updatedData2.length; k++) {
          if (String(updatedData2[k][0]) === articleId) newCount2++;
        }
        return ContentService.createTextOutput(JSON.stringify({
          success: true, toggled: 'added', flowerCount: newCount2
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // ─── XỬ LÝ GỬI BÀI MỚI (mặc định) ───
    const sheet = getSheet();

    // Upload ảnh lên Drive nếu có
    let imageUrl = '';
    if (body.base64Data && body.mimeType && body.fileName) {
      const blob = Utilities.newBlob(
        Utilities.base64Decode(body.base64Data),
        body.mimeType,
        body.fileName
      );
      const folder = DriveApp.getFolderById('1Vs4kl7ch9MkfY711NtxlBUKV4I8Nlxh2');
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      imageUrl = 'https://drive.google.com/uc?id=' + file.getId();
    }

    // Ghi thêm 1 dòng mới vào sheet
    sheet.appendRow([
      new Date(),           // A: Thời gian
      body.hoTen || '',     // B: Họ tên
      body.donVi || '',     // C: Đơn vị
      body.tieuDe || '',    // D: Tiêu đề
      body.tieuChi || '',   // E: Tiêu chí
      body.noiDung || '',   // F: Nội dung
      imageUrl,             // G: Link Ảnh
      'Chờ duyệt',         // H: Trạng thái
      '',                   // I: Nhận xét
      body.soDienThoai || '' // J: SĐT
    ]);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// 3. HÀM LẤY DỮ LIỆU CHO ADMIN DASHBOARD
// ==========================================
function getAdminData() {
  try {
    const sheet = getSheet();
    if (!sheet) throw new Error('Không tìm thấy sheet');

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    // Lấy thống kê hoa
    const flowerCounts = countAllFlowers();

    const entries = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Bỏ qua dòng hoàn toàn trống
      const hasContent = row.some(function (cell) { return cell !== '' && cell !== null && cell !== undefined; });
      if (!hasContent) continue;

      var rowIndex = i + 1;
      entries.push({
        rowIndex: rowIndex,
        thoiGian: safeDate(row[0]),
        hoTen: safeStr(row[1]),
        donVi: safeStr(row[2]),
        tieuDe: safeStr(row[3]),
        tieuChi: safeStr(row[4]),
        noiDung: safeStr(row[5]),
        linkAnh: safeStr(row[6]),
        trangThai: safeStr(row[7]) || 'Chờ duyệt',
        nhanXet: safeStr(row[8]),
        sdt: safeStr(row[9]),
        flowerCount: flowerCounts[String(rowIndex)] || 0 // Thêm số lượng hoa vào admin data
      });
    }

    // Sắp xếp: Ưu tiên bài "Chờ duyệt" lên đầu, sau đó theo thời gian mới nhất
    entries.sort(function (a, b) {
      if (a.trangThai === 'Chờ duyệt' && b.trangThai !== 'Chờ duyệt') return -1;
      if (a.trangThai !== 'Chờ duyệt' && b.trangThai === 'Chờ duyệt') return 1;
      return new Date(b.thoiGian || 0) - new Date(a.thoiGian || 0);
    });

    return entries;

  } catch (err) {
    throw new Error('getAdminData lỗi: ' + err.message);
  }
}

// ==========================================
// 4. HÀM DUYỆT BÀI / CẬP NHẬT TRẠNG THÁI
// ==========================================
function updateEntryStatus(rowIndex, newStatus, newComment) {
  const sheet = getSheet();

  // Cột H là Trạng thái (Cột số 8), Cột I là Nhận xét (Cột số 9)
  sheet.getRange(rowIndex, 8).setValue(newStatus);
  sheet.getRange(rowIndex, 9).setValue(newComment);

  return { success: true, message: "Đã cập nhật bài viết thành công!" };
}

// ==========================================
// 5. HÀM XÓA BÀI VIẾT
// ==========================================
function deleteEntry(rowIndex) {
  try {
    const sheet = getSheet();
    if (!sheet) throw new Error('Không tìm thấy sheet');

    // Lấy link ảnh ở cột G (cột 7) trước khi xóa dòng
    var linkAnh = sheet.getRange(rowIndex, 7).getValue();

    // Nếu có ảnh Drive → xóa file ảnh
    if (linkAnh) {
      var fileId = '';
      // Hỗ trợ nhiều dạng URL Drive
      var match = String(linkAnh).match(/[?&]id=([a-zA-Z0-9_-]+)/)
        || String(linkAnh).match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match) fileId = match[1];

      if (fileId) {
        try {
          DriveApp.getFileById(fileId).setTrashed(true); // Chuyển vào thùng rác
        } catch (driveErr) {
          // Bỏ qua nếu file không tồn tại hoặc không có quyền
          Logger.log('Không xóa được ảnh: ' + driveErr.message);
        }
      }
    }

    // Xóa dòng trong sheet
    sheet.deleteRow(rowIndex);

    return { success: true, message: "Đã xóa bài viết và ảnh đính kèm!" };
  } catch (err) {
    throw new Error('deleteEntry lỗi: ' + err.message);
  }
}

// ==========================================
// 6. SỬA NỘI DUNG BÀI VIẾT (Admin inline edit)
// ==========================================
function updateEntryContent(rowIndex, newTieuDe, newNoiDung) {
  try {
    const sheet = getSheet();
    if (!sheet) throw new Error('Không tìm thấy sheet');

    // Cột D = Tiêu đề (4), Cột F = Nội dung (6)
    sheet.getRange(rowIndex, 4).setValue(newTieuDe);
    sheet.getRange(rowIndex, 6).setValue(newNoiDung);

    return { success: true, message: "Đã cập nhật nội dung bài viết!" };
  } catch (err) {
    throw new Error('updateEntryContent lỗi: ' + err.message);
  }
}

// ==========================================
// 7. DUYỆT HÀNG LOẠT — Duyệt tất cả bài Chờ duyệt
// ==========================================
function bulkApprove(rowIndices) {
  try {
    const sheet = getSheet();
    if (!sheet) throw new Error('Không tìm thấy sheet');

    var count = 0;
    for (var i = 0; i < rowIndices.length; i++) {
      sheet.getRange(rowIndices[i], 8).setValue('Đã duyệt');
      count++;
    }

    return { success: true, message: "Đã duyệt " + count + " bài viết!", count: count };
  } catch (err) {
    throw new Error('bulkApprove lỗi: ' + err.message);
  }
}

// ==========================================
// 8. XÓA TOÀN BỘ BÀI TỪ CHỐI
// ==========================================
function bulkDeleteRejected() {
  try {
    const sheet = getSheet();
    if (!sheet) throw new Error('Không tìm thấy sheet');

    const data = sheet.getDataRange().getValues();
    var deletedCount = 0;

    // Xóa từ dưới lên để không bị lệch index
    for (var i = data.length - 1; i >= 1; i--) {
      var trangThai = safeStr(data[i][7]);
      if (trangThai === 'Từ chối') {
        // Xóa ảnh Drive nếu có
        var linkAnh = safeStr(data[i][6]);
        if (linkAnh) {
          var fileId = '';
          var match = String(linkAnh).match(/[?&]id=([a-zA-Z0-9_-]+)/)
            || String(linkAnh).match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (match) fileId = match[1];
          if (fileId) {
            try { DriveApp.getFileById(fileId).setTrashed(true); } catch (e) { }
          }
        }
        sheet.deleteRow(i + 1);
        deletedCount++;
      }
    }

    return { success: true, message: "Đã xóa " + deletedCount + " bài viết bị từ chối!", count: deletedCount };
  } catch (err) {
    throw new Error('bulkDeleteRejected lỗi: ' + err.message);
  }
}