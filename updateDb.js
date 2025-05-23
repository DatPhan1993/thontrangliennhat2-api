const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'database.json');

// Read the current database
let db;
try {
  const rawData = fs.readFileSync(dbPath, 'utf8');
  db = JSON.parse(rawData);
  console.log('Database loaded successfully');
} catch (error) {
  console.error('Error reading database:', error);
  db = { 
    products: [], 
    categories: [], 
    news: [], 
    images: [], 
    videos: [],
    services: [],
    navigation: [],
    users: [],
    experiences: []
  };
  console.log('Created a new database structure');
}

// Ensure experiences array exists
if (!db.experiences) {
  db.experiences = [];
  console.log('Added experiences array');
}

// Add sample experiences if none exist
if (db.experiences.length === 0) {
  db.experiences = [
    {
      id: 1,
      title: 'Trải nghiệm sản xuất cá lồng',
      description: 'Khám phá quy trình nuôi cá lồng tại hồ thủy điện',
      content: 'Nội dung chi tiết về trải nghiệm nuôi cá lồng tại hồ thủy điện. Tại đây du khách sẽ được tham quan và trực tiếp tham gia vào các hoạt động như cho cá ăn, kiểm tra lồng cá, và tìm hiểu về quy trình nuôi trồng thủy sản bền vững.',
      image: '/images/uploads/1747470335053-379185764.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Trải nghiệm làm nông dân',
      description: 'Tham gia các hoạt động nông nghiệp truyền thống',
      content: 'Tại HTX Liên Nhật, du khách có thể trải nghiệm làm nông dân thực thụ với các hoạt động như thu hoạch rau củ, tưới tiêu, và chăm sóc vườn cây. Đây là cơ hội tuyệt vời để hiểu thêm về nông nghiệp Việt Nam và kết nối với thiên nhiên.',
      image: '/images/uploads/1747470282842-919000433.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Khám phá du lịch sinh thái',
      description: 'Tham quan vùng đồi núi và hồ nước tại Liên Nhật',
      content: 'Trải nghiệm du lịch sinh thái tại Liên Nhật với các hoạt động như đi bộ đường rừng, câu cá, và ngắm cảnh thiên nhiên. Hãy tận hưởng không khí trong lành và vẻ đẹp hoang sơ của vùng đất này.',
      image: '/images/uploads/1747470785109-352236141.jpg',
      created_at: new Date().toISOString()
    }
  ];
  console.log('Added sample experiences');
}

// Ensure videos array exists
if (!db.videos) {
  db.videos = [];
  console.log('Added videos array');
}

// Add sample videos if none exist
if (db.videos.length === 0) {
  db.videos = [
    {
      id: 1,
      title: 'Giới thiệu HTX Liên Nhật',
      description: 'Video giới thiệu về Hợp tác xã Nông nghiệp - Dịch vụ Tổng hợp Liên Nhật',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: '/images/uploads/1747470702252-568725634.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Quy trình sản xuất nông nghiệp',
      description: 'Tìm hiểu về quy trình sản xuất nông nghiệp tại HTX Liên Nhật',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      thumbnail: '/images/uploads/1747397134095-18692764.jpg',
      created_at: new Date().toISOString()
    }
  ];
  console.log('Added sample videos');
}

// Write back to database
try {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log('Database updated successfully');
} catch (error) {
  console.error('Error writing database:', error);
}
