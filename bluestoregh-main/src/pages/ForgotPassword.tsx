import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password reset email sent! Please check your email for further instructions.");
        setEmail("");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Back button - positioned absolutely */}
      <button
        onClick={handleBackToLogin}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Login</span>
      </button>

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Forgot Password?
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium" 
              disabled={loading || !email.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Sending Email..." : "Send Reset Link"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Blue gradient background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 items-center justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20"></div>
        <div className="relative z-10">
          {/* Abstract geometric shapes */}
          <div className="flex items-center justify-center">
            <div className="w-24 h-6 bg-yellow-400 rounded-full transform rotate-45 mb-4"></div>
            <div className="w-24 h-6 bg-green-400 rounded-full transform -rotate-45 ml-4"></div>
          </div>
        </div>
        
        {/* Additional decorative circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-yellow-400/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
