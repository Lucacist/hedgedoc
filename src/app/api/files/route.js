import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Récupérer tous les fichiers d'une room
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('room') || 'default';

    const result = await pool.query(
      'SELECT * FROM files WHERE room_id = $1 ORDER BY updated_at DESC',
      [roomId]
    );

    return NextResponse.json({
      success: true,
      files: result.rows
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau fichier
export async function POST(request) {
  try {
    const { title, content, roomId } = await request.json();

    console.log('🆕 Creating new file:', { title, roomId, contentLength: content?.length });

    const result = await pool.query(
      `INSERT INTO files (title, content, room_id, updated_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING *`,
      [title || 'Untitled Document', content || '', roomId || 'default']
    );

    console.log('✅ File created successfully:', { id: result.rows[0].id, roomId });

    return NextResponse.json({
      success: true,
      file: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error creating file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create file' },
      { status: 500 }
    );
  }
}
