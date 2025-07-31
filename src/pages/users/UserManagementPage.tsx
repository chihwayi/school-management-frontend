import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, Button, Input, Table, Modal } from '../../components/ui';
import { Search, Edit, Trash2, Key, CheckCircle, XCircle, Shield, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userService } from '../../services/userService';
import type { UserDTO, PasswordResetDTO, EmailUpdateDTO, RoleUpdateDTO } from '../../services/userService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const UserManagementPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [isEmailUpdateModalOpen, setIsEmailUpdateModalOpen] = useState(false);
  const [isRoleUpdateModalOpen, setIsRoleUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', roles: [] as string[] });
  
  const queryClient = useQueryClient();
  
  const { data: users, isLoading: loading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers
  });

  const resetPasswordMutation = useMutation({
    mutationFn: userService.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successfully');
      setIsPasswordResetModalOpen(false);
      setSelectedUser(null);
      setNewPassword('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error('Failed to reset password');
    }
  });
  
  const updateEmailMutation = useMutation({
    mutationFn: userService.updateEmail,
    onSuccess: () => {
      toast.success('Email updated successfully');
      setIsEmailUpdateModalOpen(false);
      setSelectedUser(null);
      setNewEmail('');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error('Failed to update email');
    }
  });
  
  const updateRolesMutation = useMutation({
    mutationFn: userService.updateRoles,
    onSuccess: () => {
      toast.success('Roles updated successfully');
      setIsRoleUpdateModalOpen(false);
      setSelectedUser(null);
      setSelectedRoles([]);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error('Failed to update roles');
    }
  });
  
  const toggleStatusMutation = useMutation({
    mutationFn: userService.toggleUserStatus,
    onSuccess: () => {
      toast.success('User status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      toast.error('Failed to update user status');
    }
  });
  
  const createUserMutation = useMutation({
    mutationFn: userService.createUser,
    onSuccess: () => {
      toast.success('User created successfully');
      setIsCreateUserModalOpen(false);
      setNewUser({ username: '', email: '', password: '', roles: [] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  });
  
  const handleResetPassword = () => {
    if (!selectedUser || !newPassword) return;
    
    resetPasswordMutation.mutate({
      username: selectedUser.username,
      newPassword
    });
  };
  
  const handleUpdateEmail = () => {
    if (!selectedUser || !newEmail) return;
    
    updateEmailMutation.mutate({
      username: selectedUser.username,
      newEmail
    });
  };
  
  const handleUpdateRoles = () => {
    if (!selectedUser) return;
    
    console.log('Updating roles for user:', selectedUser.username);
    console.log('Selected roles:', selectedRoles);
    
    updateRolesMutation.mutate({
      username: selectedUser.username,
      roles: selectedRoles
    });
  };
  
  const handleToggleStatus = (username: string) => {
    toggleStatusMutation.mutate(username);
  };
  
  const handleCreateUser = () => {
    if (!newUser.username || !newUser.email || !newUser.password || newUser.roles.length === 0) {
      toast.error('Please fill all fields and select at least one role');
      return;
    }
    
    createUserMutation.mutate({
      username: newUser.username,
      email: newUser.email,
      password: newUser.password,
      roles: newUser.roles
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setIsCreateUserModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">User Accounts</h2>
          <p className="mb-4">This section allows administrators to manage user accounts, reset passwords, and update email addresses.</p>
          
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Username</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Roles</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-4">Loading...</Table.Cell>
                </Table.Row>
              ) : users?.filter(user => 
                  user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  user.email.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((user) => (
                <Table.Row key={user.id}>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>{user.email}</Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(user.roles) ? 
                        user.roles.map((role, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {typeof role === 'string' ? role.replace('ROLE_', '') : 
                             role.name ? role.name.replace('ROLE_', '') : 'Unknown'}
                          </span>
                        )) : 
                        <span className="text-gray-500">No roles</span>
                      }
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    {user.enabled ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle className="w-4 h-4 mr-1" /> Inactive
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsPasswordResetModalOpen(true);
                        }}
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setNewEmail(user.email);
                          setIsEmailUpdateModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          // Extract role names
                          const roleNames = [];
                          if (Array.isArray(user.roles)) {
                            for (const role of user.roles) {
                              if (typeof role === 'string') {
                                roleNames.push(role);
                              } else if (role && role.name) {
                                roleNames.push(role.name);
                              }
                            }
                          }
                          setSelectedRoles(roleNames);
                          setIsRoleUpdateModalOpen(true);
                        }}
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(user.username)}
                      >
                        {user.enabled ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
              {!loading && (!users || users.length === 0) && (
                <Table.Row>
                  <Table.Cell colSpan={5} className="text-center py-4">No users found</Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Password Reset Modal */}
      <Modal
        isOpen={isPasswordResetModalOpen}
        onClose={() => {
          setIsPasswordResetModalOpen(false);
          setSelectedUser(null);
          setNewPassword('');
        }}
        title="Reset Password"
      >
        <div className="space-y-4">
          <p>Reset password for user: <strong>{selectedUser?.username}</strong></p>
          <Input
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsPasswordResetModalOpen(false);
                setSelectedUser(null);
                setNewPassword('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={!newPassword}
            >
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Email Update Modal */}
      <Modal
        isOpen={isEmailUpdateModalOpen}
        onClose={() => {
          setIsEmailUpdateModalOpen(false);
          setSelectedUser(null);
          setNewEmail('');
        }}
        title="Update Email"
      >
        <div className="space-y-4">
          <p>Update email for user: <strong>{selectedUser?.username}</strong></p>
          <Input
            type="email"
            label="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter new email"
          />
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsEmailUpdateModalOpen(false);
                setSelectedUser(null);
                setNewEmail('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateEmail}
              disabled={!newEmail}
            >
              Update Email
            </Button>
          </div>
        </div>
      </Modal>

      {/* Role Update Modal */}
      <Modal
        isOpen={isRoleUpdateModalOpen}
        onClose={() => {
          setIsRoleUpdateModalOpen(false);
          setSelectedUser(null);
          setSelectedRoles([]);
        }}
        title="Update Roles"
      >
        <div className="space-y-4">
          <p>Update roles for user: <strong>{selectedUser?.username}</strong></p>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Roles</label>
            <div className="space-y-2">
              {['ROLE_ADMIN', 'ROLE_CLERK', 'ROLE_TEACHER', 'ROLE_CLASS_TEACHER', 'ROLE_USER'].map((role) => (
                <div key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    id={role}
                    checked={selectedRoles?.includes(role) || false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRoles([...selectedRoles, role]);
                      } else {
                        setSelectedRoles(selectedRoles.filter(r => r !== role));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={role} className="ml-2 block text-sm text-gray-900">
                    {role.replace('ROLE_', '')}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsRoleUpdateModalOpen(false);
                setSelectedUser(null);
                setSelectedRoles([]);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRoles}
              disabled={selectedRoles.length === 0}
            >
              Update Roles
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateUserModalOpen}
        onClose={() => {
          setIsCreateUserModalOpen(false);
          setNewUser({ username: '', email: '', password: '', roles: [] });
        }}
        title="Create New User"
      >
        <div className="space-y-4">
          <Input
            label="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            placeholder="Enter username"
          />
          <Input
            type="email"
            label="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="Enter email"
          />
          <Input
            type="password"
            label="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            placeholder="Enter password"
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium">Roles</label>
            <div className="space-y-2">
              {['ADMIN', 'CLERK', 'TEACHER', 'CLASS_TEACHER'].map((role) => (
                <div key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`new-${role}`}
                    checked={newUser.roles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewUser({ ...newUser, roles: [...newUser.roles, role] });
                      } else {
                        setNewUser({ ...newUser, roles: newUser.roles.filter(r => r !== role) });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`new-${role}`} className="ml-2 block text-sm text-gray-900">
                    {role.replace('_', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateUserModalOpen(false);
                setNewUser({ username: '', email: '', password: '', roles: [] });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={!newUser.username || !newUser.email || !newUser.password || newUser.roles.length === 0}
              loading={createUserMutation.isPending}
            >
              Create User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;