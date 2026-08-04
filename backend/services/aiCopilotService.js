const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generate AI Academic Health & Intervention Diagnostic for a Student
 * @param {Object} studentData - Complete student record, marks, attendance & notes
 * @returns {Object} Structured AI Diagnostic & Intervention Plan
 */
async function generateStudentAiDiagnostic(studentData) {
  const { student, attendance, marks, notes } = studentData;

  const usn = student.usn;
  const name = student.userId?.name || 'Student';
  const dept = student.department;
  const sem = student.semester;
  const attPct = student.overallAttendance;
  const cieAvg = student.avgCieMarks;
  const risk = student.riskLevel;
  const assignRate = student.assignmentCompletionRate;

  const lowAttSubjects = attendance.filter(a => a.percentage < 60).map(a => `${a.subjectName} (${a.percentage}%)`);
  const lowCieSubjects = marks.filter(m => m.averageMarks < 25).map(m => `${m.subjectName} (${m.averageMarks}/50)`);

  const prompt = `
You are an expert Senior Academic Mentor & Educational Consultant at an elite engineering institution.
Analyze the following student's academic and attendance data and generate a comprehensive, actionable Mentoring Diagnostic Report.

--- STUDENT DATA ---
Name: ${name}
USN: ${usn}
Department: ${dept}
Current Semester: ${sem}
Risk Level: ${risk}
Overall Attendance: ${attPct}%
Average CIE Marks: ${cieAvg} / 50
Assignment Completion: ${assignRate}%
Low Attendance Subjects: ${lowAttSubjects.length > 0 ? lowAttSubjects.join(', ') : 'None'}
Low CIE Subjects: ${lowCieSubjects.length > 0 ? lowCieSubjects.join(', ') : 'None'}

Generate a JSON response with the following exact keys:
1. "summary": A concise 2-sentence summary of the student's current academic standing and overall risk posture.
2. "rootCauses": An array of 3 specific root causes for their performance (e.g. attendance gaps, subject difficulty, time management).
3. "keyStrengths": An array of 2 positive observations or strengths.
4. "interventionPlan": An array of 4 clear, step-by-step mentor intervention strategies.
5. "actionItems": An array of 3 concrete action items for the student to complete over the next 14 days.
6. "parentDraft": A short, professional, encouraging email draft that the HOD or Mentor can send to the parent/guardian.

Return ONLY valid JSON matching this schema. No markdown backticks or commentary outside JSON.
`;

  // Attempt using Gemini API if key is set
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Clean JSON string if markdown fences exist
      const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedJson);
    } catch (err) {
      console.warn('[AI Copilot] Gemini API call failed or rate-limited. Falling back to local smart engine:', err.message);
    }
  }

  // Fallback Smart Rule Engine Diagnostic
  return {
    summary: `${name} (${usn}) currently holds a ${risk} Risk standing in Semester ${sem} of ${dept} with ${attPct}% attendance and an average CIE score of ${cieAvg}/50.`,
    rootCauses: [
      lowAttSubjects.length > 0 
        ? `Attendance drop in core courses: ${lowAttSubjects.slice(0, 2).join(', ')}`
        : `Lapses in regular laboratory and tutorial class participation`,
      lowCieSubjects.length > 0
        ? `Difficulty mastering concepts in ${lowCieSubjects.slice(0, 2).join(', ')}`
        : `Inconsistent revision schedule leading up to Internal Assessment (CIE) exams`,
      assignRate < 70
        ? `Pending assignment submissions affecting internal assessment score calculation`
        : `Need for enhanced problem-solving and time-allocation strategies during examinations`
    ],
    keyStrengths: [
      `Maintains active engagement in assigned department laboratory sessions`,
      `Demonstrates strong potential when guided through structured 1-on-1 mentoring sessions`
    ],
    interventionPlan: [
      `Schedule a 20-minute 1-on-1 counseling session to establish a 14-day study timetable`,
      `Pair ${name} with a high-performing peer study partner in ${lowCieSubjects[0] || 'core subjects'}`,
      `Issue an official attendance improvement warning requiring weekly sign-off from subject faculty`,
      `Conduct a follow-up CIE review meeting before the next internal assessment`
    ],
    actionItems: [
      `Submit pending lab and theory assignments by this Friday`,
      `Attend remedial tutorial classes for ${lowCieSubjects[0] || 'difficult subjects'}`,
      `Maintain minimum 85% attendance across all upcoming lectures`
    ],
    parentDraft: `Dear Parent/Guardian,\n\nWe are sharing an academic progress update regarding ${name} (${usn}). Currently, ${name} has an attendance rate of ${attPct}% and an average CIE score of ${cieAvg}/50. We have initiated a personalized mentoring plan and paired ${name} with faculty guidance to support their academic improvement. Please feel free to reach out if you have any questions.\n\nWarm regards,\nDepartment HOD & Faculty Mentors`
  };
}

module.exports = { generateStudentAiDiagnostic };
