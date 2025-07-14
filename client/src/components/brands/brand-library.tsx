import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, User, Mail, Phone, Globe, MapPin, 
  MessageSquare, Plus, Edit3, Trash2, Copy, ExternalLink,
  Users, Target, Heart, Palette, Award, Briefcase,
  Instagram, Facebook, Twitter, Linkedin, Star
} from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { useBrandStore } from "@/hooks/use-brand";
import { useBrands } from "@/hooks/use-brands";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface BrandLibraryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CustomField {
  label: string;
  value: string;
  type: string;
}

export default function BrandLibrary({ open, onOpenChange }: BrandLibraryProps) {
  const { selectedBrand } = useBrandStore();
  const { data: brands, refetch: refetchBrands } = useBrands();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'assets' | 'social'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newCustomField, setNewCustomField] = useState({ label: '', value: '', type: 'text' });
  
  const brand = brands?.find(b => b.id === selectedBrand?.id) || selectedBrand;

  if (!brand) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Brand Library</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Brand Selected</h3>
              <p className="text-gray-600">Please select a brand to view its library.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Brand Overview', icon: Palette },
    { id: 'contacts', label: 'Contacts & Info', icon: User },
    { id: 'assets', label: 'Brand Assets', icon: Briefcase },
    { id: 'social', label: 'Social Media', icon: MessageSquare },
  ];

  const addCustomField = () => {
    if (newCustomField.label && newCustomField.value) {
      setCustomFields([...customFields, { ...newCustomField }]);
      setNewCustomField({ label: '', value: '', type: 'text' });
      toast({
        title: "Custom Field Added",
        description: "The custom field has been added successfully.",
      });
    }
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
    toast({
      title: "Custom Field Removed",
      description: "The custom field has been removed.",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${label} has been copied to your clipboard.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {brand.logo && (
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="w-12 h-12 object-contain rounded-lg border"
                />
              )}
              <div>
                <DialogTitle className="text-2xl">{brand.name} Library</DialogTitle>
                <p className="text-gray-600">Complete brand information and assets</p>
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? "Save Changes" : "Edit Brand"}
            </Button>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b bg-gray-50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Brand Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Brand Identity */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          Brand Identity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Vision</Label>
                          {isEditing ? (
                            <Textarea 
                              defaultValue={brand.vision || ''} 
                              placeholder="Enter brand vision..."
                              className="mt-1"
                            />
                          ) : (
                            <p className="mt-1 text-gray-800">{brand.vision || 'No vision statement defined'}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Mission</Label>
                          {isEditing ? (
                            <Textarea 
                              defaultValue={brand.mission || ''} 
                              placeholder="Enter brand mission..."
                              className="mt-1"
                            />
                          ) : (
                            <p className="mt-1 text-gray-800">{brand.mission || 'No mission statement defined'}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Core Values</Label>
                          {isEditing ? (
                            <Textarea 
                              defaultValue={brand.values || ''} 
                              placeholder="Enter core values..."
                              className="mt-1"
                            />
                          ) : (
                            <p className="mt-1 text-gray-800">{brand.values || 'No core values defined'}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Target Audience */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-blue-500" />
                          Target Audience
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Demographics</Label>
                          {isEditing ? (
                            <Textarea 
                              defaultValue={brand.targetAudience || ''} 
                              placeholder="Describe target audience demographics..."
                              className="mt-1"
                            />
                          ) : (
                            <p className="mt-1 text-gray-800">{brand.targetAudience || 'No target audience defined'}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Industry</Label>
                          {isEditing ? (
                            <Input 
                              defaultValue={brand.industry || ''} 
                              placeholder="Enter industry..."
                              className="mt-1"
                            />
                          ) : (
                            <p className="mt-1 text-gray-800">{brand.industry || 'No industry specified'}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Business Type</Label>
                          {isEditing ? (
                            <Input 
                              defaultValue={brand.businessType || ''} 
                              placeholder="Enter business type..."
                              className="mt-1"
                            />
                          ) : (
                            <p className="mt-1 text-gray-800">{brand.businessType || 'No business type specified'}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Brand Guidelines */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-500" />
                        Brand Guidelines & Story
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Brand Guidelines</Label>
                        {isEditing ? (
                          <Textarea 
                            defaultValue={brand.brandGuidelines || ''} 
                            placeholder="Enter brand guidelines, tone of voice, etc..."
                            className="mt-1 min-h-[100px]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">{brand.brandGuidelines || 'No brand guidelines defined'}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Brand Story</Label>
                        {isEditing ? (
                          <Textarea 
                            defaultValue={brand.brandStory || ''} 
                            placeholder="Tell the brand's story..."
                            className="mt-1 min-h-[100px]"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">{brand.brandStory || 'No brand story defined'}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Contacts & Info Tab */}
              {activeTab === 'contacts' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Primary Contact */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5 text-green-500" />
                          Primary Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Name</Label>
                            {isEditing ? (
                              <Input 
                                defaultValue={brand.primaryContactName || ''} 
                                placeholder="Full name..."
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 flex items-center justify-between">
                                <p className="text-gray-800">{brand.primaryContactName || 'Not specified'}</p>
                                {brand.primaryContactName && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(brand.primaryContactName!, 'Primary contact name')}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Role</Label>
                            {isEditing ? (
                              <Input 
                                defaultValue={brand.primaryContactRole || ''} 
                                placeholder="Job title..."
                                className="mt-1"
                              />
                            ) : (
                              <p className="mt-1 text-gray-800">{brand.primaryContactRole || 'Not specified'}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Email</Label>
                          {isEditing ? (
                            <Input 
                              defaultValue={brand.primaryContactEmail || ''} 
                              placeholder="email@example.com"
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-1 flex items-center justify-between">
                              <p className="text-gray-800">{brand.primaryContactEmail || 'Not specified'}</p>
                              {brand.primaryContactEmail && (
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(brand.primaryContactEmail!, 'Primary contact email')}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => window.open(`mailto:${brand.primaryContactEmail}`, '_blank')}
                                  >
                                    <Mail className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                          {isEditing ? (
                            <Input 
                              defaultValue={brand.primaryContactPhone || ''} 
                              placeholder="+1 (555) 123-4567"
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-1 flex items-center justify-between">
                              <p className="text-gray-800">{brand.primaryContactPhone || 'Not specified'}</p>
                              {brand.primaryContactPhone && (
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(brand.primaryContactPhone!, 'Primary contact phone')}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => window.open(`tel:${brand.primaryContactPhone}`, '_blank')}
                                  >
                                    <Phone className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Secondary Contact */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-blue-500" />
                          Secondary Contact
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Name</Label>
                            {isEditing ? (
                              <Input 
                                defaultValue={brand.secondaryContactName || ''} 
                                placeholder="Full name..."
                                className="mt-1"
                              />
                            ) : (
                              <div className="mt-1 flex items-center justify-between">
                                <p className="text-gray-800">{brand.secondaryContactName || 'Not specified'}</p>
                                {brand.secondaryContactName && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(brand.secondaryContactName!, 'Secondary contact name')}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Role</Label>
                            {isEditing ? (
                              <Input 
                                defaultValue={brand.secondaryContactRole || ''} 
                                placeholder="Job title..."
                                className="mt-1"
                              />
                            ) : (
                              <p className="mt-1 text-gray-800">{brand.secondaryContactRole || 'Not specified'}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Email</Label>
                          {isEditing ? (
                            <Input 
                              defaultValue={brand.secondaryContactEmail || ''} 
                              placeholder="email@example.com"
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-1 flex items-center justify-between">
                              <p className="text-gray-800">{brand.secondaryContactEmail || 'Not specified'}</p>
                              {brand.secondaryContactEmail && (
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(brand.secondaryContactEmail!, 'Secondary contact email')}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => window.open(`mailto:${brand.secondaryContactEmail}`, '_blank')}
                                  >
                                    <Mail className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                          {isEditing ? (
                            <Input 
                              defaultValue={brand.secondaryContactPhone || ''} 
                              placeholder="+1 (555) 123-4567"
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-1 flex items-center justify-between">
                              <p className="text-gray-800">{brand.secondaryContactPhone || 'Not specified'}</p>
                              {brand.secondaryContactPhone && (
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(brand.secondaryContactPhone!, 'Secondary contact phone')}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => window.open(`tel:${brand.secondaryContactPhone}`, '_blank')}
                                  >
                                    <Phone className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Business Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-500" />
                        Business Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Website</Label>
                          {isEditing ? (
                            <Input 
                              defaultValue={brand.website || ''} 
                              placeholder="https://example.com"
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-1 flex items-center justify-between">
                              <p className="text-gray-800">{brand.website || 'Not specified'}</p>
                              {brand.website && (
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(brand.website!, 'Website URL')}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => window.open(brand.website, '_blank')}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-gray-700">Office Phone</Label>
                          {isEditing ? (
                            <Input 
                              defaultValue={brand.officePhone || ''} 
                              placeholder="+1 (555) 123-4567"
                              className="mt-1"
                            />
                          ) : (
                            <div className="mt-1 flex items-center justify-between">
                              <p className="text-gray-800">{brand.officePhone || 'Not specified'}</p>
                              {brand.officePhone && (
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => copyToClipboard(brand.officePhone!, 'Office phone')}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => window.open(`tel:${brand.officePhone}`, '_blank')}
                                  >
                                    <Phone className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-gray-700">Business Address</Label>
                        {isEditing ? (
                          <Textarea 
                            defaultValue={brand.businessAddress || ''} 
                            placeholder="Enter full business address..."
                            className="mt-1 min-h-[100px]"
                          />
                        ) : (
                          <div className="mt-1 flex items-start justify-between">
                            <p className="text-gray-800 flex-1">{brand.businessAddress || 'Not specified'}</p>
                            {brand.businessAddress && (
                              <div className="flex gap-1 ml-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(brand.businessAddress!, 'Business address')}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(brand.businessAddress!)}`, '_blank')}
                                >
                                  <MapPin className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Custom Fields */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          Custom Fields
                        </div>
                        {isEditing && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={addCustomField}
                            className="flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Field
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {customFields.length > 0 ? (
                        <div className="space-y-3">
                          {customFields.map((field, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-sm text-gray-700">{field.label}</p>
                                <p className="text-gray-800">{field.value}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => copyToClipboard(field.value, field.label)}
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                                {isEditing && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeCustomField(index)}
                                  >
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center py-4">No custom fields added yet.</p>
                      )}
                      
                      {isEditing && (
                        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                          <h4 className="font-medium text-sm text-gray-700 mb-3">Add New Custom Field</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Field label..."
                              value={newCustomField.label}
                              onChange={(e) => setNewCustomField({...newCustomField, label: e.target.value})}
                            />
                            <Input
                              placeholder="Field value..."
                              value={newCustomField.value}
                              onChange={(e) => setNewCustomField({...newCustomField, value: e.target.value})}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Brand Assets Tab */}
              {activeTab === 'assets' && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand Assets</h3>
                    <p className="text-gray-600 mb-4">This section will contain brand assets like logos, templates, and media files.</p>
                    {isEditing && (
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Upload Assets
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Social Media Tab */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Social Media Handles */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-purple-500" />
                          Social Media Handles
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          { key: 'instagramHandle', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                          { key: 'facebookPage', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
                          { key: 'twitterHandle', label: 'Twitter', icon: Twitter, color: 'text-blue-400' },
                          { key: 'tiktokHandle', label: 'TikTok', icon: FaTiktok, color: 'text-black' },
                          { key: 'linkedinPage', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
                        ].map((social) => {
                          const Icon = social.icon;
                          const value = (brand as any)[social.key];
                          
                          return (
                            <div key={social.key}>
                              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${social.color}`} />
                                {social.label}
                              </Label>
                              {isEditing ? (
                                <Input 
                                  defaultValue={value || ''} 
                                  placeholder={`@${social.label.toLowerCase()}_handle`}
                                  className="mt-1"
                                />
                              ) : (
                                <div className="mt-1 flex items-center justify-between">
                                  <p className="text-gray-800">{value || 'Not specified'}</p>
                                  {value && (
                                    <div className="flex gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => copyToClipboard(value, social.label)}
                                      >
                                        <Copy className="w-3 h-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => {
                                          const url = social.key === 'instagramHandle' ? `https://instagram.com/${value.replace('@', '')}` :
                                                      social.key === 'facebookPage' ? `https://facebook.com/${value.replace('@', '')}` :
                                                      social.key === 'twitterHandle' ? `https://twitter.com/${value.replace('@', '')}` :
                                                      social.key === 'tiktokHandle' ? `https://tiktok.com/@${value.replace('@', '')}` :
                                                      social.key === 'linkedinPage' ? `https://linkedin.com/company/${value.replace('@', '')}` : '#';
                                          window.open(url, '_blank');
                                        }}
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>

                    {/* Placeholder for Analytics/Performance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-500" />
                          Performance Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8">
                          <p className="text-gray-600">Social media performance metrics will be displayed here when integrated with platform APIs.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}