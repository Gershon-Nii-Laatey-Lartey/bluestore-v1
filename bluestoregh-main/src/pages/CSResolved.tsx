
import { useState } from "react";
import { CustomerServiceSidebar } from "@/components/CustomerServiceSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Search, Eye, Clock, User } from "lucide-react";

const CSResolved = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock resolved cases data
  const resolvedCases = [
    {
      id: "CS-001",
      type: "KYC Verification",
      userName: "John Doe",
      userEmail: "john@example.com",
      resolvedBy: "Agent Sarah",
      resolvedDate: "2024-06-05",
      resolutionTime: "2 hours",
      status: "approved",
      description: "Identity verification completed successfully"
    },
    {
      id: "CS-002",
      type: "Ad Review",
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      resolvedBy: "Agent Mike",
      resolvedDate: "2024-06-04",
      resolutionTime: "45 minutes",
      status: "rejected",
      description: "Ad content violated platform guidelines"
    },
    {
      id: "CS-003",
      type: "Support Ticket",
      userName: "Mike Johnson",
      userEmail: "mike@example.com",
      resolvedBy: "Agent Lisa",
      resolvedDate: "2024-06-03",
      resolutionTime: "1.5 hours",
      status: "resolved",
      description: "Payment issue resolved, refund processed"
    },
    {
      id: "CS-004",
      type: "KYC Verification",
      userName: "Alice Brown",
      userEmail: "alice@example.com",
      resolvedBy: "Agent Sarah",
      resolvedDate: "2024-06-02",
      resolutionTime: "3 hours",
      status: "approved",
      description: "Business verification completed"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "resolved":
        return <Badge className="bg-blue-100 text-blue-800">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "KYC Verification":
        return "border-l-4 border-l-blue-500";
      case "Ad Review":
        return "border-l-4 border-l-orange-500";
      case "Support Ticket":
        return "border-l-4 border-l-green-500";
      default:
        return "border-l-4 border-l-gray-500";
    }
  };

  const filteredCases = resolvedCases.filter(case_ =>
    case_.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-blue-50 flex w-full">
        <CustomerServiceSidebar />
        <SidebarInset className="flex-1">
          <div className="p-8 pt-24">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">Resolved Cases</h1>
              <p className="text-blue-700">Review completed customer service cases and resolutions.</p>
            </div>

            <Card className="border-blue-200">
              <CardHeader className="bg-blue-50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-blue-900 flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>All Resolved Cases</span>
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search cases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCases.map((case_) => (
                    <Card key={case_.id} className={`${getTypeColor(case_.type)}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{case_.id}</h3>
                              <Badge variant="outline">{case_.type}</Badge>
                              {getStatusBadge(case_.status)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>{case_.userName}</span>
                                <span className="text-gray-400">({case_.userEmail})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>Resolved in {case_.resolutionTime}</span>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 mb-3">{case_.description}</p>
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>Resolved by: <strong>{case_.resolvedBy}</strong></span>
                              <span>{case_.resolvedDate}</span>
                            </div>
                          </div>
                          
                          <Button variant="outline" size="sm" className="ml-4">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredCases.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No resolved cases found</h3>
                    <p className="text-gray-500">Try adjusting your search criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default CSResolved;
