import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, School, Mail, Phone, Globe, MapPin } from 'lucide-react';
import type { SchoolConfigDTO } from '../../types';
import { Button, Input, Card, Textarea } from '../ui';
import { cn } from '../../utils';

interface SchoolSetupFormProps {
  onSubmit: (config: SchoolConfigDTO, logo?: File, background?: File) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const SchoolSetupForm: React.FC<SchoolSetupFormProps> = ({ onSubmit, isLoading, error }) => {
  const [logo, setLogo] = useState<File | null>(null);
  const [background, setBackground] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolConfigDTO>();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackground(file);
      const reader = new FileReader();
      reader.onload = (e) => setBackgroundPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (data: SchoolConfigDTO) => {
    try {
      await onSubmit(data, logo || undefined, background || undefined);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <School className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">School Setup</h1>
          <p className="text-gray-600 mt-2">Configure your school's information and branding</p>
        </div>

        <Card className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    School Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    className={cn(
                      errors.name && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    )}
                    placeholder="Enter school name"
                    {...register('name', {
                      required: 'School name is required',
                      minLength: {
                        value: 2,
                        message: 'School name must be at least 2 characters'
                      }
                    })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="contactEmail"
                      type="email"
                      className={cn(
                        'pl-10',
                        errors.contactEmail && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      )}
                      placeholder="school@example.com"
                      {...register('contactEmail', {
                        required: 'Contact email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                    />
                  </div>
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="contactPhone"
                      type="tel"
                      className={cn(
                        'pl-10',
                        errors.contactPhone && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      )}
                      placeholder="+263 xxx xxx xxx"
                      {...register('contactPhone', {
                        required: 'Contact phone is required',
                        pattern: {
                          value: /^[+]?[\d\s-()]+$/,
                          message: 'Please enter a valid phone number'
                        }
                      })}
                    />
                  </div>
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="website"
                      type="url"
                      className={cn(
                        'pl-10',
                        errors.website && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      )}
                      placeholder="https://www.school.com"
                      {...register('website', {
                        pattern: {
                          value: /^https?:\/\/.+\..+/,
                          message: 'Please enter a valid URL'
                        }
                      })}
                    />
                  </div>
                  {errors.website && (
                    <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <Textarea
                    id="address"
                    rows={3}
                    className={cn(
                      'pl-10',
                      errors.address && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    )}
                    placeholder="Enter school address"
                    {...register('address', {
                      required: 'Address is required',
                      minLength: {
                        value: 10,
                        message: 'Address must be at least 10 characters'
                      }
                    })}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <Textarea
                  id="description"
                  rows={4}
                  className={cn(
                    errors.description && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  )}
                  placeholder="Brief description of your school"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            {/* Branding */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Branding</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Color *
                  </label>
                  <Input
                    id="primaryColor"
                    type="color"
                    className={cn(
                      'h-12 w-full',
                      errors.primaryColor && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    )}
                    {...register('primaryColor', {
                      required: 'Primary color is required'
                    })}
                  />
                  {errors.primaryColor && (
                    <p className="mt-1 text-sm text-red-600">{errors.primaryColor.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Secondary Color *
                  </label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    className={cn(
                      'h-12 w-full',
                      errors.secondaryColor && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    )}
                    {...register('secondaryColor', {
                      required: 'Secondary color is required'
                    })}
                  />
                  {errors.secondaryColor && (
                    <p className="mt-1 text-sm text-red-600">{errors.secondaryColor.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Logo & Background</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Logo
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="mx-auto h-32 w-32 object-contain"
                        />
                      ) : (
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Upload logo</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleLogoChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {backgroundPreview ? (
                        <img
                          src={backgroundPreview}
                          alt="Background preview"
                          className="mx-auto h-32 w-full object-cover rounded"
                        />
                      ) : (
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Upload background</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleBackgroundChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Setting up school...' : 'Complete Setup'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SchoolSetupForm;