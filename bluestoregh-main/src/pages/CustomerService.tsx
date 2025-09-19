import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomerServiceSidebar } from "@/components/CustomerServiceSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useSearchParams } from "react-router-dom";

interface Agent {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'busy';
  assignedTickets: number;
}

interface KYCTicket {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  assignedAgent?: string;
  documents: {
    idFront: string;
    idBack: string;
    selfie: string;
  };
  personalInfo: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
  };
  storeInfo: {
    name: string;
    description: string;
    category: string;
    location: string;
  };
}

interface AdTicket {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  assignedAgent?: string;
  adData: {
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
  };
}

interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  submittedAt: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  assignedAgent?: string;
  subject: string;
  description: string;
  responses: Array<{
    id: string;
    message: string;
    timestamp: string;
    isAgent: boolean;
    agentName?: string;
  }>;
}

const CustomerService = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [agents] = useState<Agent[]>([
    { id: '1', name: 'Sarah Johnson', avatar: '/placeholder.svg', status: 'available', assignedTickets: 3 },
    { id: '2', name: 'Mike Chen', avatar: '/placeholder.svg', status: 'available', assignedTickets: 2 },
    { id: '3', name: 'Emma Davis', avatar: '/placeholder.svg', status: 'busy', assignedTickets: 5 },
  ]);

  const [kycTickets, setKycTickets] = useState<KYCTicket[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'John Doe',
      userAvatar: '/placeholder.svg',
      submittedAt: '2024-01-15T10:30:00Z',
      status: 'pending',
      assignedAgent: '1',
      documents: {
        idFront: 'id_front.jpg',
        idBack: 'id_back.jpg',
        selfie: 'selfie.jpg'
      },
      personalInfo: {
        fullName: 'John Doe',
        phone: '+233 24 123 4567',
        email: 'john@example.com',
        address: '123 Main St, Accra'
      },
      storeInfo: {
        name: 'John\'s Electronics',
        description: 'Quality electronics and gadgets',
        category: 'electronics',
        location: 'Accra'
      }
    }
  ]);

  const [adTickets, setAdTickets] = useState<AdTicket[]>([
    {
      id: '1',
      userId: 'user2',
      userName: 'Jane Smith',
      userAvatar: '/placeholder.svg',
      submittedAt: '2024-01-15T14:20:00Z',
      status: 'pending',
      assignedAgent: '2',
      adData: {
        title: 'iPhone 15 Pro Max',
        description: 'Brand new iPhone 15 Pro Max, 256GB',
        price: 1200,
        category: 'smartphones',
        images: ['phone1.jpg', 'phone2.jpg']
      }
    }
  ]);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      userId: 'user3',
      userName: 'Bob Wilson',
      userAvatar: '/placeholder.svg',
      submittedAt: '2024-01-15T09:15:00Z',
      status: 'open',
      priority: 'high',
      subject: 'Payment Issue',
      description: 'Unable to process payment for my order',
      responses: []
    }
  ]);

  // Round-robin assignment function
  const assignToNextAgent = () => {
    const availableAgents = agents.filter(agent => agent.status === 'available');
    if (availableAgents.length === 0) return agents[0].id; // Fallback to first agent
    
    // Find agent with least tickets
    const agentWithLeastTickets = availableAgents.reduce((prev, current) => 
      prev.assignedTickets < current.assignedTickets ? prev : current
    );
    
    return agentWithLeastTickets.id;
  };

  const handleKYCAction = (ticketId: string, action: 'approve' | 'reject') => {
    setKycTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: action === 'approve' ? 'approved' : 'rejected' }
        : ticket
    ));

    toast({
      title: `KYC ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      description: `The KYC verification has been ${action === 'approve' ? 'approved' : 'rejected'}.`
    });
  };

  const handleAdAction = (ticketId: string, action: 'approve' | 'reject') => {
    setAdTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: action === 'approve' ? 'approved' : 'rejected' }
        : ticket
    ));

    toast({
      title: `Ad ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      description: `The advertisement has been ${action === 'approve' ? 'approved' : 'rejected'}.`
    });
  };

  const getStatusBadge = (status: string, priority?: string) => {
    switch (status) {
      case 'pending':
      case 'open':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'approved':
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <CustomerServiceSidebar />
        
        <div className="flex-1">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Customer Service Dashboard</h1>
                  <p className="text-gray-600 mt-1">Manage KYC verifications, ad reviews, and customer support</p>
                </div>
                <Avatar>
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-600 text-white">CS</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          <div className="p-6 max-w-7xl mx-auto">
            {/* Agent Status Overview */}
            <Card className="mb-6 bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900">
                  <User className="h-5 w-5 mr-2" />
                  Agent Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <Avatar>
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{agent.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${agent.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-sm text-gray-600 capitalize">{agent.status}</span>
                          <span className="text-sm text-gray-500">({agent.assignedTickets} tickets)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} className="space-y-4">
              <TabsList className="bg-white border border-gray-200">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Overview</TabsTrigger>
                <TabsTrigger value="kyc" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">KYC Verification</TabsTrigger>
                <TabsTrigger value="ads" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Ad Review</TabsTrigger>
                <TabsTrigger value="support" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Customer Support</TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">User Management</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Welcome to Customer Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Select a tab above to start managing tickets and customer requests.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* KYC Verification Tab */}
              <TabsContent value="kyc">
                <div className="space-y-4">
                  {kycTickets.map((ticket) => (
                    <Card key={ticket.id} className="bg-white border border-gray-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={ticket.userAvatar} />
                              <AvatarFallback>{ticket.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">{ticket.userName}</h3>
                              <p className="text-sm text-gray-500">Submitted {new Date(ticket.submittedAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(ticket.status)}
                            <span className="text-sm text-gray-500">Agent: {agents.find(a => a.id === ticket.assignedAgent)?.name}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2 text-gray-900">Personal Information</h4>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-800"><span className="font-medium">Name:</span> {ticket.personalInfo.fullName}</p>
                              <p className="flex items-center text-gray-800"><Phone className="h-3 w-3 mr-1" />{ticket.personalInfo.phone}</p>
                              <p className="flex items-center text-gray-800"><Mail className="h-3 w-3 mr-1" />{ticket.personalInfo.email}</p>
                              <p className="flex items-center text-gray-800"><MapPin className="h-3 w-3 mr-1" />{ticket.personalInfo.address}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2 text-gray-900">Store Information</h4>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-800"><span className="font-medium">Store:</span> {ticket.storeInfo.name}</p>
                              <p className="text-gray-800"><span className="font-medium">Category:</span> {ticket.storeInfo.category}</p>
                              <p className="text-gray-800"><span className="font-medium">Location:</span> {ticket.storeInfo.location}</p>
                              <p className="text-gray-800"><span className="font-medium">Description:</span> {ticket.storeInfo.description}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-gray-900">Documents</h4>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 border border-gray-200 rounded">
                              <FileText className="h-8 w-8 mx-auto mb-1 text-gray-400" />
                              <p className="text-xs text-gray-600">ID Front</p>
                            </div>
                            <div className="text-center p-2 border border-gray-200 rounded">
                              <FileText className="h-8 w-8 mx-auto mb-1 text-gray-400" />
                              <p className="text-xs text-gray-600">ID Back</p>
                            </div>
                            <div className="text-center p-2 border border-gray-200 rounded">
                              <FileText className="h-8 w-8 mx-auto mb-1 text-gray-400" />
                              <p className="text-xs text-gray-600">Selfie with ID</p>
                            </div>
                          </div>
                        </div>

                        {ticket.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleKYCAction(ticket.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleKYCAction(ticket.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Ad Review Tab */}
              <TabsContent value="ads">
                <div className="space-y-4">
                  {adTickets.map((ticket) => (
                    <Card key={ticket.id} className="bg-white border border-gray-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={ticket.userAvatar} />
                              <AvatarFallback>{ticket.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">{ticket.userName}</h3>
                              <p className="text-sm text-gray-500">Submitted {new Date(ticket.submittedAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(ticket.status)}
                            <span className="text-sm text-gray-500">Agent: {agents.find(a => a.id === ticket.assignedAgent)?.name}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-lg text-gray-900">{ticket.adData.title}</h4>
                          <p className="text-2xl font-bold text-blue-600">${ticket.adData.price}</p>
                          <p className="text-gray-600 mt-2">{ticket.adData.description}</p>
                          <p className="text-sm text-gray-500 mt-1">Category: {ticket.adData.category}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-gray-900">Images ({ticket.adData.images.length})</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {ticket.adData.images.map((image, index) => (
                              <div key={index} className="aspect-square bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                <span className="text-2xl">📷</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {ticket.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleAdAction(ticket.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve Ad
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleAdAction(ticket.id, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject Ad
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Customer Support Tab */}
              <TabsContent value="support">
                <div className="space-y-4">
                  {supportTickets.map((ticket) => (
                    <Card key={ticket.id} className="bg-white border border-gray-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={ticket.userAvatar} />
                              <AvatarFallback>{ticket.userName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">{ticket.userName}</h3>
                              <p className="text-sm text-gray-500">Submitted {new Date(ticket.submittedAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(ticket.status)}
                            {getPriorityBadge(ticket.priority)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-semibold mb-2 text-gray-900">{ticket.subject}</h4>
                        <p className="text-gray-600 mb-4">{ticket.description}</p>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Respond
                          </Button>
                          <Button variant="outline" size="sm">
                            <Clock className="h-4 w-4 mr-2" />
                            Mark In Progress
                          </Button>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* User Management Tab */}
              <TabsContent value="users">
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">User Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">User management features coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CustomerService;
