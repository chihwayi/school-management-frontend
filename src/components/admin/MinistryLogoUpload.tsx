import React, { useState, useEffect } from 'react';
import { Card, Button } from '../ui';
import { ministryService } from '../../services/ministryService';
import { Upload, Check, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';

const MinistryLogoUpload: React.FC = () => {
  const [ministryLogo, setMinistryLogo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMinistryLogo();
  }, []);

  const loadMinistryLogo = async () => {
    try {
      const logoPath = await ministryService.getCurrentMinistryLogo();
      setMinistryLogo(logoPath);
    } catch (error) {
      console.error('Error loading ministry logo:', error);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setUploading(true);
      const logoPath = await ministryService.uploadMinistryLogo(file);
      setMinistryLogo(logoPath);
      toast.success('Ministry logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload ministry logo');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <Building2 className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold">Ministry of Education Logo</h3>
      </div>
      
      {ministryLogo ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="h-5 w-5" />
            <span>Ministry logo uploaded</span>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50">
            <img 
              src={getImageUrl(ministryLogo) || ''}
              alt="Ministry of Education Logo"
              className="max-h-24 max-w-full object-contain"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => document.getElementById('ministry-logo-file')?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Update Ministry Logo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Ministry Logo</h4>
            <Button
              onClick={() => document.getElementById('ministry-logo-file')?.click()}
              disabled={uploading}
              loading={uploading}
            >
              Select Logo
            </Button>
          </div>
        </div>
      )}
      
      <input
        id="ministry-logo-file"
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </Card>
  );
};

export default MinistryLogoUpload;