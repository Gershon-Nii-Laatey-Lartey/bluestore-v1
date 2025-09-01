
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Clock, CheckCircle, XCircle, Eye, Calendar } from "lucide-react";
import { KYCDetailModal } from "./KYCDetailModal";
import { KYCRejectionModal } from "./KYCRejectionModal";
import { useState } from "react";

interface KYCVerificationTabProps {
  pendingKyc: any[];
  approvedKyc: any[];
  rejectedKyc: any[];
  onApproval: (kycId: string, approved: boolean, rejectionReason?: string) => void;
}

export const KYCVerificationTab = ({ 
  pendingKyc, 
  approvedKyc, 
  rejectedKyc, 
  onApproval 
}: KYCVerificationTabProps) => {
  const [rejectionModal, setRejectionModal] = useState<{ kycId: string; kycName: string } | null>(null);

  const handleQuickApprove = (kycId: string) => {
    onApproval(kycId, true);
  };

  const handleQuickReject = (kycId: string, kycName: string) => {
    setRejectionModal({ kycId, kycName });
  };

  const handleRejectConfirm = (rejectionReason: string) => {
    if (rejectionModal) {
      onApproval(rejectionModal.kycId, false, rejectionReason);
      setRejectionModal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* KYC Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending KYC</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{pendingKyc.length}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{approvedKyc.length}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">{rejectedKyc.length}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending KYC Submissions */}
      {pendingKyc.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Pending KYC Verifications</span>
              <Badge variant="secondary">{pendingKyc.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {pendingKyc.map((kyc, index) => (
                <div key={kyc.id}>
                  <div className="border rounded-xl p-4 sm:p-6 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{kyc.full_name}</h3>
                        <p className="text-gray-600 mb-2 truncate">{kyc.store_name}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-2">
                          <span className="capitalize font-medium truncate">{kyc.product_category}</span>
                          <Separator orientation="vertical" className="h-4 hidden sm:block" />
                          <span className="flex items-center space-x-1 truncate">
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{new Date(kyc.submitted_at).toLocaleDateString()}</span>
                          </span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                          Pending Verification
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-4 border-t gap-3">
                      <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="w-full sm:w-auto">
                              <Eye className="h-4 w-4 mr-2" />
                              View More
                            </Button>
                          </DialogTrigger>
                          <KYCDetailModal kyc={kyc} onApproval={onApproval} />
                        </Dialog>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" 
                          onClick={() => handleQuickApprove(kyc.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="w-full sm:w-auto"
                          onClick={() => handleQuickReject(kyc.id, kyc.full_name)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                  {index < pendingKyc.length - 1 && <Separator className="my-6" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending KYC Verifications</h3>
              <p className="text-gray-600">All KYC submissions have been processed.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Rejection Modal */}
      <KYCRejectionModal
        isOpen={!!rejectionModal}
        onClose={() => setRejectionModal(null)}
        onReject={handleRejectConfirm}
        kycName={rejectionModal?.kycName || ''}
      />
    </div>
  );
};
