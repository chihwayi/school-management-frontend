import React from 'react';
// PDF rendering will be implemented when @react-pdf/renderer is installed
// For now, we'll create a mock component
import type { Report, SubjectReport } from '../../types';

// This is a mock component until @react-pdf/renderer is installed

interface ReportCardPDFProps {
  report: any;
  schoolSettings: any;
}

const ReportCardPDF: React.FC<ReportCardPDFProps> = ({ report, schoolSettings }) => {
  return (
    <div className="p-4 border rounded">
      <h2>Report Card Preview</h2>
      <p>Student: {report.student?.firstName} {report.student?.lastName}</p>
      <p>Term: {report.term}</p>
      <p>Academic Year: {report.academicYear}</p>
      <p>This is a placeholder. Install @react-pdf/renderer to enable PDF generation.</p>
    </div>
  );
};

export default ReportCardPDF;

/* Styles will be implemented when @react-pdf/renderer is installed
const styles = {
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0.1,
    width: 300,
    height: 300,
  },
  headerCenter: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  studentInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  studentInfoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  studentInfoLabel: {
    width: 120,
    fontWeight: 'bold',
  },
  studentInfoValue: {
    flex: 1,
  },
  attendanceInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  attendanceLabel: {
    width: 120,
    fontWeight: 'bold',
  },
  attendanceValue: {
    flex: 1,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  tableHeaderRow: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  tableColSubject: {
    width: '20%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 5,
  },
  tableColGroup: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 5,
    backgroundColor: '#e0e0e0',
  },
  tableColMark: {
    width: '10%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 5,
    textAlign: 'center',
  },
  tableColGrade: {
    width: '5%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 5,
    textAlign: 'center',
  },
  tableColComment: {
    width: '40%',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 5,
  },
  tableColSignature: {
    width: '15%',
    padding: 5,
  },
  signature: {
    width: 60,
    height: 30,
  },
  commentSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
  },
  commentTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentText: {
    marginBottom: 10,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  signatureBox: {
    width: 150,
    height: 60,
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureImage: {
    width: 100,
    height: 40,
  },
  signatureLabel: {
    fontSize: 8,
    marginTop: 5,
  },
  stampBox: {
    width: 120,
    height: 120,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  stampText: {
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: 'grey',
  },
});
*/

  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        {schoolSettings.schoolLogoUrl && (
          <Image src={schoolSettings.schoolLogoUrl} style={styles.watermark} />
        )}
        
        {/* Header */}
        <View style={styles.header}>
          {/* School Logo */}
          {schoolSettings.schoolLogoUrl && (
            <Image src={schoolSettings.schoolLogoUrl} style={styles.logo} />
          )}
          
          {/* School Name and Report Title */}
          <View style={styles.headerCenter}>
            <Text style={styles.schoolName}>{schoolSettings.schoolName || 'SCHOOL NAME'}</Text>
            <Text style={styles.reportTitle}>STUDENT PROGRESS REPORT</Text>
            <Text>{report.term} - {report.academicYear}</Text>
          </View>
          
          {/* Ministry Logo */}
          {schoolSettings.ministryLogoUrl && (
            <Image src={schoolSettings.ministryLogoUrl} style={styles.logo} />
          )}
        </View>
        
        {/* Student Information */}
        <View style={styles.studentInfo}>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoLabel}>Student Name:</Text>
            <Text style={styles.studentInfoValue}>{report.student.firstName} {report.student.lastName}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoLabel}>Form/Class:</Text>
            <Text style={styles.studentInfoValue}>{report.student.form} {report.student.section}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoLabel}>Subjects Recorded:</Text>
            <Text style={styles.studentInfoValue}>{report.subjectReports.length}</Text>
          </View>
          <View style={styles.studentInfoRow}>
            <Text style={styles.studentInfoLabel}>Subjects Passed:</Text>
            <Text style={styles.studentInfoValue}>{passedSubjects}</Text>
          </View>
        </View>
        
        {/* Attendance Information */}
        {report.attendanceDays && report.totalSchoolDays && (
          <View style={styles.attendanceInfo}>
            <Text style={styles.attendanceLabel}>Attendance:</Text>
            <Text style={styles.attendanceValue}>
              {report.attendanceDays} out of {report.totalSchoolDays} days ({Math.round((report.attendanceDays / report.totalSchoolDays) * 100)}%)
            </Text>
          </View>
        )}
        
        {/* Subject Reports Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={styles.tableColGroup}>
              <Text>Group</Text>
            </View>
            <View style={styles.tableColSubject}>
              <Text>Subject</Text>
            </View>
            <View style={styles.tableColMark}>
              <Text>Course Work %</Text>
            </View>
            <View style={styles.tableColGrade}>
              <Text>Grade</Text>
            </View>
            <View style={styles.tableColMark}>
              <Text>Exam %</Text>
            </View>
            <View style={styles.tableColGrade}>
              <Text>Grade</Text>
            </View>
            <View style={styles.tableColComment}>
              <Text>Teacher's Comment</Text>
            </View>
            <View style={styles.tableColSignature}>
              <Text>Signature</Text>
            </View>
          </View>
          
          {/* Table Rows - Grouped by Subject Category */}
          {Object.entries(subjectGroups).map(([category, subjects]) => (
            <React.Fragment key={category}>
              {subjects.map((subjectReport, index) => (
                <View style={styles.tableRow} key={subjectReport.id}>
                  {index === 0 && (
                    <View style={styles.tableColGroup}>
                      <Text>{category}</Text>
                    </View>
                  )}
                  {index !== 0 && <View style={styles.tableColGroup}></View>}
                  <View style={styles.tableColSubject}>
                    <Text>{subjectReport.subject.name}</Text>
                  </View>
                  <View style={styles.tableColMark}>
                    <Text>{subjectReport.courseworkMark ? Math.round(subjectReport.courseworkMark) : 'N/A'}</Text>
                  </View>
                  <View style={styles.tableColGrade}>
                    <Text>{subjectReport.courseworkMark ? calculateGrade(subjectReport.courseworkMark) : ''}</Text>
                  </View>
                  <View style={styles.tableColMark}>
                    <Text>{subjectReport.examMark ? Math.round(subjectReport.examMark) : 'N/A'}</Text>
                  </View>
                  <View style={styles.tableColGrade}>
                    <Text>{subjectReport.examMark ? calculateGrade(subjectReport.examMark) : ''}</Text>
                  </View>
                  <View style={styles.tableColComment}>
                    <Text>{subjectReport.teacherComment || ''}</Text>
                  </View>
                  <View style={styles.tableColSignature}>
                    {subjectReport.teacherSignatureUrl ? (
                      <Image src={subjectReport.teacherSignatureUrl} style={styles.signature} />
                    ) : (
                      <Text>_____________</Text>
                    )}
                  </View>
                </View>
              ))}
            </React.Fragment>
          ))}
        </View>
        
        {/* Class Teacher's Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.commentTitle}>Class Teacher's Comment:</Text>
          <Text style={styles.commentText}>{report.overallComment || ''}</Text>
          <View style={styles.signatureSection}>
            <View>
              <Text>Class Teacher: {report.classTeacher?.firstName} {report.classTeacher?.lastName}</Text>
              {report.classTeacherSignatureUrl ? (
                <Image src={report.classTeacherSignatureUrl} style={styles.signatureImage} />
              ) : (
                <Text>_________________________</Text>
              )}
            </View>
            <View style={styles.stampBox}>
              <Text style={styles.stampText}>SCHOOL STAMP</Text>
            </View>
          </View>
        </View>
        
        {/* Principal's Comment */}
        <View style={styles.commentSection}>
          <Text style={styles.commentTitle}>Principal's Comment:</Text>
          <Text style={styles.commentText}>{report.principalComment || ''}</Text>
          <View style={styles.signatureSection}>
            <View>
              <Text>Principal: {schoolSettings.principalName || ''}</Text>
              {schoolSettings.principalSignatureUrl ? (
                <Image src={schoolSettings.principalSignatureUrl} style={styles.signatureImage} />
              ) : (
                <Text>_________________________</Text>
              )}
            </View>
          </View>
        </View>
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>{schoolSettings.reportFooterText || 'This is an official school report. Any alterations will render it invalid.'}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Helper function to calculate grade
const calculateGrade = (mark: number): string => {
  if (mark >= 80) return 'A';
  if (mark >= 70) return 'B';
  if (mark >= 60) return 'C';
  if (mark >= 50) return 'D';
  if (mark >= 40) return 'E';
  return 'U';
};

export default ReportCardPDF;