// 1. CHUẨN BỊ THƯ MỤC LƯU ẢNH TRÊN GOOGLE DRIVE
// Tạo một thư mục trên Google Drive của bạn.
// Chia sẻ thư mục đó: Quyền truy cập -> "Bất kỳ ai có liên kết đều có thể xem" (Viewer).
// Copy ID của thư mục đó (thường nằm sau /folders/ trên URL) và dán vào biến FOLDER_ID bên dưới.

const FOLDER_ID = "YÊU_CẦU_ĐIỀN_FOLDER_ID_CỦA_BẠN_VÀO_ĐÂY"; 
const SHEET_NAME = "DuLieu";

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ "success": false, "error": "Không tìm thấy Sheet 'DuLieu'" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = JSON.parse(e.postData.contents);
    var timestamp = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
    
    var fileUrl = "";
    
    // Nếu có upload file thì lưu vào Drive
    if (data.base64Data && data.mimeType && data.fileName && FOLDER_ID !== "YÊU_CẦU_ĐIỀN_FOLDER_ID_CỦA_BẠN_VÀO_ĐÂY") {
      var folder = DriveApp.getFolderById(FOLDER_ID);
      var blob = Utilities.newBlob(Utilities.base64Decode(data.base64Data), data.mimeType, data.fileName);
      var file = folder.createFile(blob);
      fileUrl = "https://lh3.googleusercontent.com/d/" + file.getId(); // Sử dụng direct link
    }
    
    // Cấu trúc cột theo kế hoạch: timestamp, hoTen, donVi, tieuDe, tieuChi, noiDung, linkAnh, trangThai, nhanXet, (điện thoại nếu cần)
    // Tôi sẽ lưu Số điện thoại vào cột J để dự phòng liên hệ.
    sheet.appendRow([
      timestamp, 
      data.hoTen || "", 
      data.donVi || "", 
      data.tieuDe || "", 
      data.tieuChi || "", 
      data.noiDung || "", 
      fileUrl, 
      "Chờ duyệt", 
      "", 
      data.soDienThoai || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "success": true, "message": "Gửi lưu bút thành công!" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "success": false, "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ "success": false, "data": [] })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  var result = [];
  // Bỏ qua dòng header nếu có (bắt đầu từ 1)
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var trangThai = row[7];
    
    // Chỉ lấy bài "Đã duyệt"
    if (trangThai === "Đã duyệt" || trangThai === "Da duyet") {
      result.push({
        id: i,
        timestamp: row[0],
        hoTen: row[1],
        donVi: row[2],
        tieuDe: row[3],
        tieuChi: row[4],
        noiDung: row[5],
        linkAnh: row[6],
        trangThai: row[7],
        nhanXet: row[8]
      });
    }
  }
  
  // Đảo ngược để bài mới nhất lên trên
  result.reverse();
  
  return ContentService.createTextOutput(JSON.stringify({ "success": true, "data": result }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Xử lý CORS Options
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT).setHeaders(headers);
}
