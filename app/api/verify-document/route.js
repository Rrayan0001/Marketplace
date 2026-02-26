import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyDocumentWithAI } from '@/lib/groq';

export async function POST(request) {
    try {
        const { documentId, profileId } = await request.json();

        if (!documentId || !profileId) {
            return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Fetch the document record
        const { data: document, error: fetchError } = await supabase
            .from('documents')
            .select('*')
            .eq('id', documentId)
            .eq('profile_id', profileId)
            .single();

        if (fetchError || !document) {
            return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
        }

        // 2. We already have the public file_url (since Bucket is Public)
        const publicUrl = document.file_url;

        // 3. Update status to 'processing'
        await supabase.from('documents').update({ ai_status: 'processing' }).eq('id', documentId);

        // 4. Call Groq Vision API
        let extractedData = null;
        let aiStatus = 'failed';
        let aiFlags = [];

        try {
            extractedData = await verifyDocumentWithAI(publicUrl, document.document_type);

            // Determine pass/flag based on confidence and format
            if (extractedData.is_valid_format && extractedData.confidence_score > 0.8) {
                aiStatus = 'passed';
            } else {
                aiStatus = 'flagged';
                aiFlags.push("Low confidence or invalid document format detected.");
            }
        } catch (aiError) {
            console.error("AI Error:", aiError);
            aiFlags.push(aiError.message || "Failed to process image through AI.");
        }

        // 5. Update the Database with AI results
        const { error: updateError } = await supabase
            .from('documents')
            .update({
                ai_status: aiStatus,
                ai_extracted_data: extractedData,
                ai_confidence_score: extractedData?.confidence_score || null,
                ai_flags: aiFlags.length > 0 ? aiFlags : null
            })
            .eq('id', documentId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true, aiStatus, extractedData });

    } catch (error) {
        console.error('Verify Document API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
