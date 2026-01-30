"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  Loader2,
  RefreshCw,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import {
  addSesDomain,
  deleteSesDomain,
  setActiveDomain,
  updateOrganization,
  verifySesDomain,
} from "@/lib/actions";
import Form from "@/components/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Domain {
  id: string;
  domain: string;
  provider: string;
  status: string | null;
  awsRegion: string | null;
  dkimPublicKey: string | null;
  dkimSelector: string | null;
  dkimStatus: string | null;
  spfStatus: string | null;
  clickTracking: boolean;
  openTracking: boolean;
  createdAt: Date;
}

interface DnsRecord {
  type: string;
  name: string;
  value: string;
  priority?: number;
}

interface DomainsClientProps {
  emailProvider: "ses" | "resend";
  organizationId: string;
  organizationName: string;
  domains: Domain[];
  activeDomainId: string | null;
  emailApiKey: string;
  domainOptionsForResend: { value: string; label: string }[];
}

const MAX_DOMAINS = 3;

const AWS_REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "us-east-2", label: "US East (Ohio)" },
  { value: "us-west-1", label: "US West (N. California)" },
  { value: "us-west-2", label: "US West (Oregon)" },
  { value: "eu-west-1", label: "EU (Ireland)" },
  { value: "eu-west-2", label: "EU (London)" },
  { value: "eu-central-1", label: "EU (Frankfurt)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
  { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
];

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600 dark:bg-[#252525] dark:text-stone-400">
        <Clock className="h-3 w-3" />
        Unknown
      </span>
    );
  }

  const statusLower = status.toLowerCase();

  if (statusLower === "success" || statusLower === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
        <CheckCircle2 className="h-3 w-3" />
        Verified
      </span>
    );
  }

  if (statusLower === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  }

  if (statusLower === "failed" || statusLower === "error") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
        <XCircle className="h-3 w-3" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600 dark:bg-[#252525] dark:text-stone-400">
      <AlertCircle className="h-3 w-3" />
      {status}
    </span>
  );
}

function DnsRecordsTable({ records }: { records: DnsRecord[] }) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-20">Priority</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-mono text-xs">{record.type}</TableCell>
              <TableCell className="max-w-[200px] truncate font-mono text-xs">
                {record.name}
              </TableCell>
              <TableCell className="max-w-[300px] truncate font-mono text-xs">
                {record.value}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {record.priority || "-"}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(record.value)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function DomainsClient({
  emailProvider,
  organizationId,
  organizationName,
  domains,
  activeDomainId,
  emailApiKey,
  domainOptionsForResend,
}: DomainsClientProps) {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newRegion, setNewRegion] = useState("us-east-1");
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[] | null>(null);
  const [verifyingDomainId, setVerifyingDomainId] = useState<string | null>(
    null,
  );
  const [deletingDomainId, setDeletingDomainId] = useState<string | null>(null);
  const [settingActiveDomainId, setSettingActiveDomainId] = useState<
    string | null
  >(null);

  const canAddMore = domains.length < MAX_DOMAINS;

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    // Basic domain validation
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i;
    if (!domainRegex.test(newDomain.trim())) {
      toast.error("Please enter a valid domain name");
      return;
    }

    setIsAddingDomain(true);

    try {
      const result = await addSesDomain(
        newDomain.trim().toLowerCase(),
        organizationId,
        newRegion,
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.dnsRecords) {
        setDnsRecords(result.dnsRecords);
        toast.success("Domain added! Configure the DNS records below.");
      }

      router.refresh();
    } catch (error) {
      toast.error("Failed to add domain");
    } finally {
      setIsAddingDomain(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingDomainId(domainId);

    const VERIFY_TIMEOUT_MS = 20_000;

    try {
      const result = await Promise.race([
        verifySesDomain(domainId),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Verification check timed out. Try again.")),
            VERIFY_TIMEOUT_MS,
          ),
        ),
      ]);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.verified) {
        toast.success("Domain verified successfully!");
      } else {
        toast.info(
          "Domain verification still pending. Please check your DNS configuration.",
        );
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to verify domain";
      toast.error(message);
    } finally {
      setVerifyingDomainId(null);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    setDeletingDomainId(domainId);

    try {
      const result = await deleteSesDomain(domainId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Domain deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete domain");
    } finally {
      setDeletingDomainId(null);
    }
  };

  const handleSetActiveDomain = async (domainId: string) => {
    setSettingActiveDomainId(domainId);

    try {
      const result = await setActiveDomain(organizationId, domainId);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Active domain updated");
      router.refresh();
    } catch (error) {
      toast.error("Failed to set active domain");
    } finally {
      setSettingActiveDomainId(null);
    }
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setNewDomain("");
    setNewRegion("us-east-1");
    setDnsRecords(null);
  };

  if (emailProvider === "resend") {
    return (
      <div className="flex flex-col space-y-6">
        <Form
          title="Email API Key"
          description="Set a custom Resend API key for this organization. Optional. Overrides the global Resend API key."
          helpText="Leave blank to use the global RESEND_API_KEY."
          inputAttrs={{
            name: "emailApiKey",
            type: "password",
            defaultValue: emailApiKey,
            placeholder: "re_abc123...",
          }}
          handleSubmit={updateOrganization}
        />
        <div className="flex justify-end gap-2">
          <Link
            href="/docs/advanced-users/resend-integration"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm">
              View Docs
            </Button>
          </Link>
        </div>
        <Form
          title="Active Sending Domain"
          description={`Pick which verified domain Resend should use. Defaults to ${process.env.EMAIL_DOMAIN ?? "your default domain"}.`}
          helpText={
            domainOptionsForResend.length <= 1
              ? "No domains on this API key yet."
              : "Choose a domain (or leave blank for default)."
          }
          inputAttrs={{
            name: "activeDomainId",
            type: "select",
            defaultValue: activeDomainId ?? "",
            options: domainOptionsForResend,
          }}
          handleSubmit={updateOrganization}
          disabled={domainOptionsForResend.length <= 1}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Sending Domains</CardTitle>
              <CardDescription className="mt-1">
                Manage domains for sending emails via Amazon SES. You can add up
                to {MAX_DOMAINS} domains per organization.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!canAddMore}>Add Domain</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Email Sending Domain</DialogTitle>
                  <DialogDescription>
                    Add a domain to send emails from. You&apos;ll need to
                    configure DNS records to verify ownership.
                  </DialogDescription>
                </DialogHeader>

                {!dnsRecords ? (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain Name</Label>
                      <Input
                        id="domain"
                        placeholder="example.com"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        disabled={isAddingDomain}
                      />
                      <p className="text-xs text-stone-500">
                        Enter the domain you want to send emails from (e.g.,
                        example.com)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">AWS Region</Label>
                      <Select
                        value={newRegion}
                        onValueChange={setNewRegion}
                        disabled={isAddingDomain}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AWS_REGIONS.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-stone-500">
                        Choose the AWS region closest to your users for better
                        delivery
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 py-4">
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-medium">
                          Domain Added Successfully!
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                        Please add the following DNS records to verify your
                        domain.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Required DNS Records</Label>
                      <DnsRecordsTable records={dnsRecords} />
                      <p className="text-xs text-stone-500">
                        DNS propagation can take up to 48 hours. Click
                        &quot;Check Verification&quot; after adding these
                        records.
                      </p>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {!dnsRecords ? (
                    <>
                      <Button variant="outline" onClick={closeDialog}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddDomain}
                        disabled={isAddingDomain}
                      >
                        {isAddingDomain && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Add Domain
                      </Button>
                    </>
                  ) : (
                    <Button onClick={closeDialog}>Done</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        {!canAddMore && (
          <CardContent className="pt-0">
            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Domain Limit Reached</span>
              </div>
              <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                You have reached the maximum of {MAX_DOMAINS} domains. Delete an
                existing domain to add a new one.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Domains List */}
      {domains.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-stone-300 dark:text-stone-600" />
            <h3 className="mt-4 text-lg font-medium text-stone-900 dark:text-stone-100">
              No domains configured
            </h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              Add your first sending domain to start sending emails.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                      <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {domain.domain}
                        </CardTitle>
                        {activeDomainId === domain.id && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            <Star className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </div>
                      <CardDescription className="mt-1 flex items-center gap-2">
                        <StatusBadge status={domain.status} />
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs">
                          {domain.awsRegion || "us-east-1"}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs uppercase">
                          {domain.provider}
                        </span>
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeDomainId !== domain.id &&
                      domain.status?.toLowerCase() === "success" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetActiveDomain(domain.id)}
                          disabled={settingActiveDomainId === domain.id}
                        >
                          {settingActiveDomainId === domain.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Star className="mr-1 h-4 w-4" />
                              Set Active
                            </>
                          )}
                        </Button>
                      )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerifyDomain(domain.id)}
                      disabled={verifyingDomainId === domain.id}
                    >
                      {verifyingDomainId === domain.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <RefreshCw className="mr-1 h-4 w-4" />
                          Check Status
                        </>
                      )}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                          disabled={deletingDomainId === domain.id}
                        >
                          {deletingDomainId === domain.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Domain</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{domain.domain}</strong>? This will remove
                            the domain from AWS SES and you will no longer be
                            able to send emails from this domain.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            type="button"
                            onClick={() => void handleDeleteDomain(domain.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>

              {domain.status?.toLowerCase() !== "success" &&
                domain.dkimPublicKey && (
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        DNS Configuration Required
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        For sending domain <strong>{domain.domain}</strong>, SES
                        requires MX and SPF on the <strong>mail</strong>{" "}
                        subdomain (
                        <code className="rounded bg-stone-100 px-1 dark:bg-[#252525]">
                          mail.{domain.domain}
                        </code>
                        ). This is the correct hostname for bounce handling and
                        SPF—add the records below at your DNS provider.
                      </p>
                      <DnsRecordsTable
                        records={[
                          {
                            type: "MX",
                            name: `mail.${domain.domain}`,
                            value: `feedback-smtp.${domain.awsRegion || "us-east-1"}.amazonses.com`,
                            priority: 10,
                          },
                          {
                            type: "TXT",
                            name: `mail.${domain.domain}`,
                            value: "v=spf1 include:amazonses.com ~all",
                          },
                          {
                            type: "TXT",
                            name: `${domain.dkimSelector || "mailer"}._domainkey.${domain.domain}`,
                            value: `p=${domain.dkimPublicKey}`,
                          },
                          {
                            type: "TXT",
                            name: `_dmarc.${domain.domain}`,
                            value: "v=DMARC1; p=none;",
                          },
                        ]}
                      />
                    </div>
                  </CardContent>
                )}

              {domain.status?.toLowerCase() === "success" && (
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-stone-500 dark:text-stone-400">
                        DKIM Status:
                      </span>
                      <span className="ml-2">
                        <StatusBadge status={domain.dkimStatus} />
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 dark:text-stone-400">
                        SPF Status:
                      </span>
                      <span className="ml-2">
                        <StatusBadge status={domain.spfStatus} />
                      </span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Need Help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-stone-600 dark:text-stone-400">
          <p>
            <strong>DNS Propagation:</strong> After adding DNS records, it can
            take up to 48 hours for changes to propagate.
          </p>
          <p>
            <strong>Verification:</strong> Click &quot;Check Status&quot; to
            refresh the verification status after configuring DNS.
          </p>
          <p>
            <strong>Active Domain:</strong> The active domain is used as the
            default sender for all emails from this organization.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
