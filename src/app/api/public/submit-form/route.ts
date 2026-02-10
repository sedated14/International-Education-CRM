import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { Lead } from '../../../../types';
import { Resend } from 'resend';



// POST /api/public/submit-form
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { formId, leadData } = body;

        // 1. Validate Form (Read from Firestore)
        const formRef = doc(db, 'forms', formId);
        const formSnap = await getDoc(formRef);

        if (!formSnap.exists()) {
            return NextResponse.json({ error: 'Invalid Form ID' }, { status: 404 });
        }

        const formConfig = formSnap.data();

        // 2. Create Lead Object
        const newLeadBase: Omit<Lead, 'id'> = {
            ...leadData,
            type: 'Student',
            source: 'Form',
            title: `Web Inquiry: ${leadData.studentProfile?.firstName || 'Student'} - ${formConfig.name}`,
            status: 'Inquiry',
            score: 5,
            createdAt: new Date().toISOString(),
            lastContactDate: new Date().toISOString(),
            notes: [{
                id: crypto.randomUUID(),
                content: `Lead captured via "${formConfig.name}" form.`,
                timestamp: new Date().toISOString(),
                author: 'System'
            }]
        };

        // 3. Save to Firestore (CRITICAL STEP - Do this first)
        const leadsRef = collection(db, 'leads');
        const docRef = await addDoc(leadsRef, newLeadBase);
        const newLeadId = docRef.id;

        // Track email results
        const emailResults = {
            student: { sent: false, error: null as string | null },
            admin: { sent: false, error: null as string | null }
        };

        // 4. Send Confirmation Email (Auto-Reply) - NON-BLOCKING
        const apiKey = process.env.RESEND_API_KEY;
        const studentEmail = leadData.studentProfile?.email || leadData.studentProfile?.studentEmail;

        if (apiKey && studentEmail) {
            try {
                const resend = new Resend(apiKey);
                await resend.emails.send({
                    from: 'Apex CRM <onboarding@resend.dev>',
                    to: studentEmail,
                    subject: `Thank you for your inquiry: ${formConfig.name}`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <h2>Thank you for your inquiry!</h2>
                            <p>Hi ${leadData.studentProfile?.firstName || 'there'},</p>
                            <p>We have received your information via the <strong>${formConfig.name}</strong> form.</p>
                            <p>One of our representatives will be in touch with you shortly to discuss your educational goals.</p>
                            <br/>
                            <p>Best regards,</p>
                            <p>The Admissions Team</p>
                        </div>
                    `
                });
                console.log(`[Email Sent] Auto-reply sent to ${studentEmail}`);
                emailResults.student.sent = true;
            } catch (emailError: any) {
                console.error('[Email Error] Failed to send auto-reply:', emailError);
                emailResults.student.error = emailError.message || 'Unknown error';
            }
        } else if (!apiKey) {
            console.warn('[Email Warning] RESEND_API_KEY is missing. Skipping auto-reply.');
            emailResults.student.error = 'RESEND_API_KEY missing';
        }

        // 5. Send Admin Notifications (if configured)
        if (apiKey && formConfig.notificationEmails && formConfig.notificationEmails.length > 0) {
            try {
                const resend = new Resend(apiKey);
                await resend.emails.send({
                    from: 'Apex CRM <onboarding@resend.dev>',
                    to: formConfig.notificationEmails,
                    subject: `New Lead: ${leadData.studentProfile?.firstName} (${formConfig.name})`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px;">
                            <h2>New Form Submission</h2>
                            <p><strong>Form:</strong> ${formConfig.name}</p>
                            <p><strong>Name:</strong> ${leadData.studentProfile?.firstName} ${leadData.studentProfile?.lastName}</p>
                            <p><strong>Email:</strong> ${studentEmail}</p>
                            <p><strong>Country:</strong> ${leadData.country}</p>
                            <br/>
                            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/students">View in CRM</a></p>
                        </div>
                    `
                });
                console.log(`[Email Sent] Admin notification sent to ${formConfig.notificationEmails.join(', ')}`);
                emailResults.admin.sent = true;
            } catch (emailError: any) {
                console.error('[Email Error] Failed to send admin notification:', emailError);
                emailResults.admin.error = emailError.message || 'Unknown error';
            }
        }

        return NextResponse.json({ success: true, leadId: newLeadId, emailResults }, { status: 201 });
    } catch (error) {
        console.error('Error submitting form:', error);
        return NextResponse.json({ error: `Failed to submit form: ${(error as Error).message}` }, { status: 500 });
    }
}
