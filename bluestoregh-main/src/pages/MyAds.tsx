
import { Layout } from "@/components/Layout";
import { MobileHeader } from "@/components/MobileHeader";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, Edit, Trash2 } from "lucide-react";

interface ProductSubmission {
  id: string;
  title: string;
  category: string;
  condition: string;
  description: string;
  price: string;
  originalPrice: string;
  negotiable: boolean;
  phone: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const MyAds = () => {
  const [submissions, setSubmissions] = useState<ProductSubmission[]>([]);
  const [viewingAd, setViewingAd] = useState<ProductSubmission | null>(null);
  const [editingAd, setEditingAd] = useState<ProductSubmission | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedSubmissions = JSON.parse(localStorage.getItem('productSubmissions') || '[]');
    setSubmissions(storedSubmissions);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = (id: string) => {
    const updatedSubmissions = submissions.filter(sub => sub.id !== id);
    setSubmissions(updatedSubmissions);
    localStorage.setItem('productSubmissions', JSON.stringify(updatedSubmissions));
    
    // Also remove from featured products if it was approved
    const featuredProducts = JSON.parse(localStorage.getItem('featuredProducts') || '[]');
    const updatedFeatured = featuredProducts.filter((product: any) => product.id !== id);
    localStorage.setItem('featuredProducts', JSON.stringify(updatedFeatured));
    
    toast({
      title: "Ad Deleted",
      description: "Your advertisement has been deleted successfully."
    });
  };

  const handleEdit = (updatedAd: ProductSubmission) => {
    const updatedSubmissions = submissions.map(sub => 
      sub.id === updatedAd.id ? updatedAd : sub
    );
    setSubmissions(updatedSubmissions);
    localStorage.setItem('productSubmissions', JSON.stringify(updatedSubmissions));
    
    // Update featured products if it was approved
    if (updatedAd.status === 'approved') {
      const featuredProducts = JSON.parse(localStorage.getItem('featuredProducts') || '[]');
      const updatedFeatured = featuredProducts.map((product: any) => 
        product.id === updatedAd.id ? {
          ...product,
          title: updatedAd.title,
          price: `GHS ${updatedAd.price}`,
          originalPrice: updatedAd.originalPrice ? `GHS ${updatedAd.originalPrice}` : undefined,
          category: updatedAd.category,
          condition: updatedAd.condition,
          description: updatedAd.description,
          location: updatedAd.location,
          phone: updatedAd.phone,
          negotiable: updatedAd.negotiable
        } : product
      );
      localStorage.setItem('featuredProducts', JSON.stringify(updatedFeatured));
    }
    
    setEditingAd(null);
    toast({
      title: "Ad Updated",
      description: "Your advertisement has been updated successfully."
    });
  };

  return (
    <Layout>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Ads</h1>
          <p className="text-gray-600 mt-1">Manage your published advertisements</p>
        </div>
        
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500">No ads submitted yet. Start by publishing your first product!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{submission.title}</CardTitle>
                      <p className="text-gray-600 capitalize">{submission.category} • {submission.condition}</p>
                    </div>
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">{submission.description.substring(0, 100)}...</p>
                      <p className="text-lg font-semibold text-green-600">GHS {submission.price}</p>
                      {submission.negotiable && (
                        <span className="text-sm text-gray-500">(Negotiable)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Location:</strong> {submission.location}</p>
                      <p><strong>Submitted:</strong> {formatDate(submission.submittedAt)}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setViewingAd(submission)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{viewingAd?.title}</DialogTitle>
                        </DialogHeader>
                        {viewingAd && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Category</label>
                                <p className="capitalize">{viewingAd.category}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Condition</label>
                                <p className="capitalize">{viewingAd.condition}</p>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Description</label>
                              <p>{viewingAd.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Price</label>
                                <p>GHS {viewingAd.price}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Original Price</label>
                                <p>{viewingAd.originalPrice ? `GHS ${viewingAd.originalPrice}` : 'N/A'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Location</label>
                                <p>{viewingAd.location}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Phone</label>
                                <p>{viewingAd.phone}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setEditingAd(submission)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Advertisement</DialogTitle>
                        </DialogHeader>
                        {editingAd && (
                          <EditAdForm ad={editingAd} onSave={handleEdit} />
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(submission.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

const EditAdForm = ({ ad, onSave }: { ad: ProductSubmission, onSave: (ad: ProductSubmission) => void }) => {
  const [formData, setFormData] = useState(ad);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Category</label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="home-garden">Home & Garden</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="laptops">Laptops</SelectItem>
              <SelectItem value="headphones">Headphones</SelectItem>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="automotive">Automotive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm font-medium">Condition</label>
          <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="refurbished">Refurbished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Price (GHS)</label>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Original Price (GHS)</label>
          <Input
            type="number"
            value={formData.originalPrice}
            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Location</label>
          <Input
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Phone Number</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        Save Changes
      </Button>
    </form>
  );
};

export default MyAds;
