import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Récupérer un fichier spécifique
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const result = await pool.query(
      'SELECT * FROM files WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      file: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un fichier
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { title, content } = await request.json();

    console.log('🔄 Updating file:', { id, title: title?.substring(0, 50), contentLength: content?.length });

    const result = await pool.query(
      `UPDATE files 
       SET title = COALESCE($1, title), 
           content = COALESCE($2, content), 
           updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [title, content, id]
    );

    console.log('📊 Update result:', { rowsAffected: result.rowCount, fileId: id });

    if (result.rows.length === 0) {
      console.log('❌ File not found:', id);
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    console.log('✅ File updated successfully:', id);
    return NextResponse.json({
      success: true,
      file: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update file' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un fichier
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const result = await pool.query(
      'DELETE FROM files WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
