const fs = require('fs');

// Đọc file database.json
const databasePath = './database.json';
const publicDatabasePath = './public/database.json';
const apiDatabasePath = './api/database.json';

// URL cũ và mới
const oldUrl = 'http://localhost:3001';
const newUrl = 'https://api.thontrangliennhat.com';

function updateDatabaseUrls(filePath) {
    try {
        // Kiểm tra file có tồn tại không
        if (!fs.existsSync(filePath)) {
            console.log(`File không tồn tại: ${filePath}`);
            return;
        }

        // Đọc nội dung file
        let data = fs.readFileSync(filePath, 'utf8');
        
        // Đếm số lần thay thế
        const matches = data.match(/http:\/\/localhost:3001/g);
        const count = matches ? matches.length : 0;
        
        if (count > 0) {
            // Thay thế tất cả localhost:3001 bằng URL production
            data = data.replace(/http:\/\/localhost:3001/g, newUrl);
            
            // Ghi lại file
            fs.writeFileSync(filePath, data, 'utf8');
            console.log(`✅ Đã cập nhật ${count} URL trong file: ${filePath}`);
        } else {
            console.log(`ℹ️  Không tìm thấy URL localhost:3001 trong file: ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Lỗi khi xử lý file ${filePath}:`, error.message);
    }
}

// Cập nhật các file database
console.log('🔄 Bắt đầu cập nhật URLs trong database files...\n');

updateDatabaseUrls(databasePath);
updateDatabaseUrls(publicDatabasePath);
updateDatabaseUrls(apiDatabasePath);

console.log('\n✅ Hoàn thành cập nhật URLs!');
console.log(`🔗 Đã thay thế tất cả URL từ: ${oldUrl}`);
console.log(`🔗 Thành URL mới: ${newUrl}`); 