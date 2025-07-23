import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import { ArrowLeft } from 'lucide-react';

// Mock teacher data
const mockTeacher = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  employeeId: 'T001',
  email: 'john.doe@school.com',
  phone: '123-456-7890',
  address: '123 Main St, Anytown, USA',
  dateOfBirth: '1980-01-01',
  gender: 'Male',
  qualification: 'Masters in Education',
  joinDate: '2020-01-01',
  subjects: [
    { id: 1, name: 'Mathematics', code: 'MATH101', classes: ['Form 1A', 'Form 2B'] },
    { id: 2, name: 'Physics', code: 'PHYS101', classes: ['Form 3A', 'Form 4B'] }
  ]
};

const MockTeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // In a real app, we would fetch the teacher data based on the ID
  // For this mock, we'll just use the static data
  const teacher = mockTeacher;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/app/teachers')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teachers
        </Button>
        <h1 className="text-2xl font-bold">Teacher Details</h1>
      </div>
      
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold">{teacher.firstName} {teacher.lastName}</h2>
            <p className="text-gray-600">Employee ID: {teacher.employeeId}</p>
          </div>
          <Badge variant="outline">Teacher</Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Personal Information</h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium w-32">Email:</span>
                <span>{teacher.email}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Phone:</span>
                <span>{teacher.phone}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Address:</span>
                <span>{teacher.address}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Date of Birth:</span>
                <span>{teacher.dateOfBirth}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Gender:</span>
                <span>{teacher.gender}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Professional Information</h3>
            <div className="space-y-2">
              <div className="flex">
                <span className="font-medium w-32">Qualification:</span>
                <span>{teacher.qualification}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Join Date:</span>
                <span>{teacher.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Assigned Subjects</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teacher.subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{subject.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{subject.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{subject.classes.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default MockTeacherDetailPage;