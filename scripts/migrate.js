const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  try {
    console.log('🚀 Starting database migration...');
    
    // Create files table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL DEFAULT 'Untitled Document',
        content TEXT DEFAULT '',
        room_id VARCHAR(100) NOT NULL DEFAULT 'default',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Create index on room_id for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_files_room_id ON files(room_id);
    `);

    // Create index on updated_at for sorting
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_files_updated_at ON files(updated_at DESC);
    `);

    // Insert a default document if none exists
    const { rows } = await pool.query('SELECT COUNT(*) FROM files');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(
        'INSERT INTO files (title, content, room_id) VALUES ($1, $2, $3)',
        [
          'Welcome to HedgeDoc Collaborative',
          '# Welcome to HedgeDoc Collaborative! 🎉\n\nThis is a collaborative Markdown editor built with Next.js, Socket.io, and PostgreSQL.\n\n## Features ✨\n\n- **Real-time collaboration**: Multiple users can edit the same document simultaneously\n- **Live preview**: See your Markdown rendered in real-time\n- **Auto-save**: Your changes are automatically saved to the database\n- **Modern UI**: Clean, iOS-inspired design with dark mode support\n- **Syntax highlighting**: Code blocks are beautifully highlighted\n\n## Getting Started 🚀\n\n1. Start typing in the editor on the left\n2. See the live preview on the right\n3. Share the room ID with others to collaborate\n4. Your changes are automatically saved!\n\n## Markdown Examples 📝\n\n### Code Block\n```javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n```\n\n### Lists\n- Item 1\n- Item 2\n  - Nested item\n  - Another nested item\n\n### Links and Images\n[Visit GitHub](https://github.com)\n\n### Tables\n| Feature | Status |\n|---------|--------|\n| Real-time editing | ✅ |\n| Auto-save | ✅ |\n| Dark mode | ✅ |\n\nHappy collaborating! 🎊',
          'welcome'
        ]
      );
    }

    console.log('✅ Database migration completed successfully!');
    console.log('📊 Tables created:');
    console.log('   - files (with indexes)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
