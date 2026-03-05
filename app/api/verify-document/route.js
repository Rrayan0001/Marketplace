import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyDocumentWithAI } from '@/lib/groq';

export async function POST(request) {
    try {
        const { documentId, profileId } = await request.json();

        if (!documentId || !profileId) {
            return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
        }

        // 1. Fetch the document record from Firestore
        const docRef = adminDb.collection('documents').doc(documentId);
        const docSnap = await docRef.get();

        if (!docSnap.exists || docSnap.data().profile_id !== profileId) {
            return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
        }

        const document = docSnap.data();
        const publicUrl = document.file_url;

        // 2. Update status to 'processing'
        await docRef.update({ ai_status: 'processing' });

        // 3. Call Groq Vision API
        let extractedData = null;
        let aiStatus = 'failed';
        let aiFlags = [];

        try {
            extractedData = await verifyDocumentWithAI(publicUrl, document.document_type);

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

        // 4. Update Firestore with AI results
        await docRef.update({
            ai_status: aiStatus,
            ai_extracted_data: extractedData,
            ai_confidence_score: extractedData?.confidence_score || null,
            ai_flags: aiFlags.length > 0 ? aiFlags : null,
        });

        return NextResponse.json({ success: true, aiStatus, extractedData });

    } catch (error) {
        console.error('Verify Document API Error:', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
