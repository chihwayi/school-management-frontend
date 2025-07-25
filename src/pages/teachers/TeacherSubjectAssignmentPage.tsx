import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Button, Select, Table } from '../../components/ui';
import { teacherService } from '../../services/teacherService';
import { subjectService } from '../../services/subjectService';
import { classGroupService } from '../../services/classGroupService';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../../components/common';
import { Plus, Trash2 } from 'lucide-react';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface Subject {
  id: number;
  name: string;
  category?: string;
  level?: string;
  subjectCode?: string;
}

interface ClassGroup {
  id: number;
  form: string;
  section: string;
  level?: string;
}

// Using a simple type to avoid TypeScript errors
// @ts-ignore
interface SubjectAssignment {
  subjectId: number;
  classGroupId: number;
  _original?: any;
}

const TeacherSubjectAssignmentPage: React.FC = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [newSubjectId, setNewSubjectId] = useState<number | null>(null);
  const [newClassId, setNewClassId] = useState<number | null>(null);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [selectedClassLevel, setSelectedClassLevel] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch teachers
  const { data: teachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ['teachers'],
    // @ts-ignore
    queryFn: teacherService.getAllTeachers
  });

  // Fetch subjects
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    // @ts-ignore
    queryFn: subjectService.getAllSubjects
  });

  // Fetch classes
  const { data: classes = [], isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    // @ts-ignore
    queryFn: classGroupService.getAllClassGroups
  });

  // Fetch teacher assignments when teacher changes
  const { data: teacherAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['teacherAssignments', selectedTeacher],
    // @ts-ignore
    queryFn: () => selectedTeacher ? teacherService.getTeacherAssignments(selectedTeacher) : Promise.resolve([]),
    enabled: !!selectedTeacher
  });

  // Update assignments when teacher assignments change - with fix for infinite loop
  useEffect(() => {
    console.log('Teacher assignments in useEffect:', teacherAssignments);
    if (Array.isArray(teacherAssignments) && teacherAssignments.length > 0) {
      // @ts-ignore - Ignore type errors for API response handling
      setAssignments(teacherAssignments.map(assignment => ({
        subjectId: assignment.subjectId,
        classGroupId: assignment.classGroupId || assignment.id, // Use classGroupId if available, fallback to id
        _original: assignment
      })));
    } else {
      setAssignments([]);
    }
  }, [JSON.stringify(teacherAssignments)]); // Use JSON.stringify to avoid infinite loops

  // Fetch subjects by level when class changes
  const fetchSubjectsByLevel = async (level: string) => {
    try {
      console.log(`Fetching subjects for level: ${level}`);
      // @ts-ignore
      const subjectsData = await subjectService.getSubjectsByLevel(level);
      console.log(`Fetched subjects for level ${level}:`, subjectsData);
      
      if (Array.isArray(subjectsData) && subjectsData.length > 0) {
        console.log(`Found ${subjectsData.length} subjects for level ${level}`);
        setFilteredSubjects(subjectsData);
      } else {
        console.log(`No subjects found for level ${level}, filtering from all subjects`);
        // Try to filter subjects by level from the complete list
        const matchingSubjects = subjects.filter(subject => {
          if (!subject.level) return false;
          
          const subjectLevel = subject.level.toUpperCase();
          const targetLevel = level.toUpperCase();
          
          // More precise level matching
          if (targetLevel === 'JUNIOR SECONDARY' || targetLevel === 'JUNIOR_SECONDARY') {
            return subjectLevel.includes('JUNIOR') || subjectLevel.includes('JUNIOR_SECONDARY');
          } else if (targetLevel === 'O LEVEL' || targetLevel === 'O_LEVEL') {
            return subjectLevel.includes('O_LEVEL') && !subjectLevel.includes('A_LEVEL');
          } else if (targetLevel === 'A LEVEL' || targetLevel === 'A_LEVEL') {
            return subjectLevel.includes('A_LEVEL');
          }
          
          return subjectLevel.includes(targetLevel);
        });
        
        if (matchingSubjects.length > 0) {
          console.log(`Found ${matchingSubjects.length} matching subjects by filtering`);
          setFilteredSubjects(matchingSubjects);
        } else {
          console.log(`No matching subjects found for level ${level}`);
          setFilteredSubjects([]);
          toast.warning(`No subjects found for ${level} level. Please select a different class.`);
        }
      }
    } catch (error) {
      console.error('Error fetching subjects by level:', error);
      toast.error('Failed to load subjects for this class level');
      // Use all subjects as fallback on error
      setFilteredSubjects(subjects);
    }
  };

  // Handle class selection
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const classId = e.target.value ? Number(e.target.value) : null;
    setNewClassId(classId);
    setNewSubjectId(null); // Reset subject selection when class changes
    
    if (classId) {
      // @ts-ignore
      const selectedClass = classes.find(c => c.id === classId);
      if (selectedClass) {
        // Determine level based on form name
        let level;
        const formName = selectedClass.form.toLowerCase();
        
        if (formName.includes('form 1') || formName.includes('form 2') || formName.includes('form 3')) {
          level = 'JUNIOR SECONDARY';
        } else if (formName.includes('form 4') || formName.includes('form 5') || formName.includes('form 6')) {
          level = 'O LEVEL';
        } else if (formName.includes('a level') || formName.includes('a-level')) {
          level = 'A LEVEL';
        } else if (formName.includes('zjs')) {
          level = 'ZJS';
        } else {
          level = 'O LEVEL'; // Default fallback
        }
        
        console.log(`Selected class ${selectedClass.form} ${selectedClass.section}, level: ${level}`);
        setSelectedClassLevel(level);
        fetchSubjectsByLevel(level);
      }
    } else {
      setSelectedClassLevel(null);
      setFilteredSubjects([]);
    }
  };

  // Save assignments mutation
  const saveAssignmentsMutation = useMutation({
    mutationFn: async (data: { teacherId: number, assignments: SubjectAssignment[] }) => {
      console.log('Saving assignments for teacher:', data.teacherId);
      console.log('Assignments to save:', data.assignments);
      
      // Ensure classGroupId is correctly set for each assignment
      const validAssignments = data.assignments.map(assignment => ({
        subjectId: assignment.subjectId,
        classGroupId: assignment.classGroupId
      }));
      
      console.log('Final assignments being sent to API:', validAssignments);
      
      if (validAssignments.length === 0) {
        throw new Error('No assignments to save');
      }
      
      // @ts-ignore
      const result = await teacherService.saveTeacherAssignments(data.teacherId, validAssignments);
      console.log('API response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Save successful, response:', data);
      // Force refresh the assignments from the server
      queryClient.invalidateQueries({ queryKey: ['teacherAssignments', selectedTeacher] });
      queryClient.refetchQueries({ queryKey: ['teacherAssignments', selectedTeacher] });
      toast.success('Subject assignments saved successfully');
      
      // Update local state with the server response
      if (Array.isArray(data) && data.length > 0) {
        setAssignments(data.map(assignment => ({
          subjectId: assignment.subjectId,
          classGroupId: assignment.classGroupId || assignment.id,
          _original: assignment
        })));
      }
    },
    onError: (error) => {
      console.error('Error saving assignments:', error);
      toast.error('Failed to save subject assignments');
    }
  });

  // Add new assignment
  const addAssignment = () => {
    if (!newSubjectId || !newClassId) {
      toast.error('Please select both subject and class');
      return;
    }

    // Check for duplicates
    const isDuplicate = assignments.some(
      a => a.subjectId === newSubjectId && a.classGroupId === newClassId
    );

    if (isDuplicate) {
      toast.error('This assignment already exists');
      return;
    }

    // Find the selected class and subject for display purposes
    // @ts-ignore
    const selectedClass = classes.find(c => c.id === newClassId);
    // @ts-ignore
    const selectedSubject = subjects.find(s => s.id === newSubjectId);
    
    // Create a new assignment with all necessary data
    const newAssignment = { 
      subjectId: newSubjectId, 
      classGroupId: newClassId,
      // Add original data for display
      _original: {
        id: newClassId,
        subjectId: newSubjectId,
        subjectName: selectedSubject?.name || 'Unknown',
        form: selectedClass?.form || '',
        section: selectedClass?.section || '',
        academicYear: new Date().getFullYear().toString(),
        teacherId: selectedTeacher || 0,
        teacherName: '',
        subjectCode: selectedSubject?.subjectCode || ''
      }
    };
    
    console.log('Adding new assignment:', newAssignment);
    setAssignments([...assignments, newAssignment]);
    setNewSubjectId(null);
    setNewClassId(null);
  };

  // Remove assignment
  const removeAssignment = (index: number) => {
    const newAssignments = [...assignments];
    newAssignments.splice(index, 1);
    setAssignments(newAssignments);
  };

  // Save all assignments
  const saveAllAssignments = () => {
    if (!selectedTeacher) {
      toast.error('Please select a teacher');
      return;
    }

    saveAssignmentsMutation.mutate({
      teacherId: selectedTeacher,
      assignments
    });
  };

  if (teachersLoading || subjectsLoading || classesLoading) {
    return <LoadingSpinner />;
  }

  // Helper function to find subject name by id
  const getSubjectName = (id: number) => {
    // First try to find in the assignments data
    if (Array.isArray(teacherAssignments)) {
      // @ts-ignore
      const assignment = teacherAssignments.find(a => a.subjectId === id);
      // @ts-ignore
      if (assignment?.subjectName) return assignment.subjectName;
    }
    
    // Fall back to subjects list
    // @ts-ignore
    return subjects.find(s => s.id === id)?.name || 'Unknown';
  };

  // Get the subjects to display based on class selection
  // Only show filtered subjects if a class is selected, otherwise show empty
  const subjectsToDisplay = selectedClassLevel && filteredSubjects.length > 0 ? filteredSubjects : 
                           selectedClassLevel ? [] : subjects;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Teacher Subject Assignment</h1>
      </div>

      {/* Teacher Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Select Teacher</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Teacher</label>
            <Select
              value={selectedTeacher?.toString() || ''}
              onChange={(e) => setSelectedTeacher(e.target.value ? Number(e.target.value) : null)}
              options={[
                { value: '', label: 'Select Teacher' },
                // @ts-ignore
                ...teachers.map(teacher => ({
                  value: teacher.id.toString(),
                  label: `${teacher.firstName} ${teacher.lastName}`
                }))
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Current Assignments */}
      {selectedTeacher && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Current Assignments</h2>
          {assignmentsLoading ? (
            <LoadingSpinner />
          ) : assignments && assignments.length > 0 ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Subject</Table.HeaderCell>
                  <Table.HeaderCell>Class</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {assignments.map((assignment, index) => (
                  <Table.Row key={index}>
                    {/* @ts-ignore */}
                    <Table.Cell>{assignment._original?.subjectName || getSubjectName(assignment.subjectId)}</Table.Cell>
                    {/* @ts-ignore */}
                    <Table.Cell>{`${assignment._original?.form || ''} ${assignment._original?.section || ''}`}</Table.Cell>
                    <Table.Cell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAssignment(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No assignments yet. Add some below.
            </div>
          )}
        </Card>
      )}

      {/* Add New Assignment */}
      {selectedTeacher && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Assignment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <Select
                value={newClassId?.toString() || ''}
                onChange={handleClassChange}
                options={[
                  { value: '', label: 'Select Class' },
                  // @ts-ignore
                  ...classes.map(classGroup => ({
                    value: classGroup.id.toString(),
                    label: `${classGroup.form} ${classGroup.section}`
                  }))
                ]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Select
                value={newSubjectId?.toString() || ''}
                onChange={(e) => setNewSubjectId(e.target.value ? Number(e.target.value) : null)}
                options={[
                  { value: '', label: 'Select Subject' },
                  // @ts-ignore
                  ...subjectsToDisplay.map(subject => ({
                    value: subject.id.toString(),
                    // @ts-ignore
                    label: subject.subjectCode ? `${subject.subjectCode} - ${subject.name}` : subject.name
                  }))
                ]}
                disabled={!newClassId}
              />
              {!newClassId && (
                <p className="text-sm text-gray-500 mt-1">Select a class first to see available subjects</p>
              )}
            </div>
            <div className="flex items-end">
              <Button onClick={addAssignment} disabled={!newClassId || !newSubjectId}>
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Save Button */}
      {selectedTeacher && assignments.length > 0 && (
        <div className="flex justify-end">
          <Button 
            onClick={saveAllAssignments}
            disabled={saveAssignmentsMutation.isPending}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            {saveAssignmentsMutation.isPending ? 'Saving...' : 'Save All Assignments'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeacherSubjectAssignmentPage;