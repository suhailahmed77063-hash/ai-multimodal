"use client";

import React, { useContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User2, 
  Mail, 
  Calendar, 
  Zap, 
  MessageSquare, 
  Coins,
  Crown,
  Settings,
  LogOut
} from "lucide-react";
import PaymentModal from "../_components/PaymentModal";
import axios from "axios";

function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && userDetail?.id) {
      fetchChatHistory();
    }
  }, [user, userDetail?.id]);

  const fetchChatHistory = async () => {
    if (!userDetail?.id) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/chat/save?userId=${userDetail.id}&limit=10`);
      setChatHistory(response.data || []);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Please sign in to view your profile</p>
      </div>
    );
  }

  const planColors = {
    Free: "bg-gray-500",
    Pro: "bg-purple-600",
    Enterprise: "bg-gradient-to-r from-purple-600 to-pink-600",
  };

  const maxCredits = userDetail?.plan === "Enterprise" ? 5000 : userDetail?.plan === "Pro" ? 1000 : 100;
  const usedCredits = maxCredits - (userDetail?.credits || 0);
  const progressPercent = Math.max(0, Math.min(100, (usedCredits / maxCredits) * 100));

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              {user.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.fullName} 
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User2 className="w-10 h-10 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.fullName || "User"}</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.primaryEmailAddress?.emailAddress}
              </p>
              <div className="mt-2">
                <Badge className={`${planColors[userDetail?.plan || "Free"]} text-white`}>
                  <Crown className="w-3 h-3 mr-1" />
                  {userDetail?.plan || "Free"} Plan
                </Badge>
              </div>
            </div>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Coins className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Credits</p>
                <p className="text-xl font-bold">{userDetail?.credits || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Messages Left</p>
                <p className="text-xl font-bold">{userDetail?.remainingMsg || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-sm font-bold">
                  {userDetail?.createdAt 
                    ? new Date(userDetail.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Credits Used</span>
                <span className="text-sm font-medium">{usedCredits}/{maxCredits}</span>
              </div>
              <Progress value={progressPercent} />
            </div>
            <p className="text-xs text-gray-400">
              {userDetail?.credits || 0} credits remaining. Upgrade your plan to get more credits.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Section */}
      {(userDetail?.plan === "Free" || !userDetail?.plan) && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Upgrade to Pro</h3>
                <p className="text-gray-500 text-sm">
                  Get 1000 credits and access to premium AI models
                </p>
              </div>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setShowPaymentModal(true)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Chat Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          ) : chatHistory.length > 0 ? (
            <div className="space-y-3">
              {chatHistory.slice(0, 5).map((msg, i) => (
                <div key={msg.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <Badge variant={msg.role === "user" ? "default" : "secondary"}>
                    {msg.model}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm line-clamp-2">{msg.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No chat history yet</p>
          )}
        </CardContent>
      </Card>

      <PaymentModal 
        open={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
      />
    </div>
  );
}

export default ProfilePage;
