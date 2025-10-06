"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TwoFactorAuth() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupDialog, setSetupDialog] = useState(false);
  const [disableDialog, setDisableDialog] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/2fa/status");
      const data = await response.json();
      setIsEnabled(data.enabled);
    } catch (error) {
      toast.error("Failed to check 2FA status");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    setProcessing(true);
    try {
      const response = await fetch("/api/2fa/setup", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to setup 2FA");
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setSetupDialog(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to setup 2FA");
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify code");
      }

      toast.success("2FA enabled successfully!");
      setIsEnabled(true);
      setSetupDialog(false);
      setVerificationCode("");
      setQrCode("");
      setSecret("");
    } catch (error: any) {
      toast.error(error.message || "Failed to enable 2FA");
    } finally {
      setProcessing(false);
    }
  };

  const handleDisable = async () => {
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to disable 2FA");
      }

      toast.success("2FA disabled successfully");
      setIsEnabled(false);
      setDisableDialog(false);
      setPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to disable 2FA");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Status:{" "}
                {isEnabled ? (
                  <span className="text-green-600 dark:text-green-400">
                    Enabled
                  </span>
                ) : (
                  <span className="text-stone-500">Disabled</span>
                )}
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {isEnabled
                  ? "Your account is protected with 2FA"
                  : "Protect your account with an authenticator app"}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isEnabled ? (
            <Button
              variant="destructive"
              onClick={() => setDisableDialog(true)}
              disabled={processing}
            >
              Disable 2FA
            </Button>
          ) : (
            <Button onClick={handleSetup} disabled={processing}>
              Enable 2FA
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={setupDialog} onOpenChange={setSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              {qrCode && (
                <Image
                  src={qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                  className="rounded-md border"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret">Or enter this code manually:</Label>
              <Input
                id="secret"
                value={secret}
                readOnly
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                pattern="[0-9]{6}"
              />
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Enter the 6-digit code from your authenticator app to verify
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSetupDialog(false);
                setVerificationCode("");
                setQrCode("");
                setSecret("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button onClick={handleVerifyAndEnable} disabled={processing}>
              {processing ? "Verifying..." : "Verify & Enable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={disableDialog} onOpenChange={setDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to disable 2FA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDisableDialog(false);
                setPassword("");
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={processing}
            >
              {processing ? "Disabling..." : "Disable 2FA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
