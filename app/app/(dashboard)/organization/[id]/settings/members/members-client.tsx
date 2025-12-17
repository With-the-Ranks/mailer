"use client";

import { MoreVertical, Shield, ShieldCheck, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import InviteMemberModal from "@/components/modal/invite-member";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  removeMember,
  revokeInvitation,
  updateMemberRole,
} from "@/lib/actions/invitation";

type Member = {
  id: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

type Invitation = {
  id: string;
  email: string | null;
  role: string;
  token: string;
  createdAt: string;
  expiresAt: string | null;
  invitedBy: {
    name: string | null;
    email: string | null;
  };
};

type MembersPageClientProps = {
  organizationId: string;
  organizationName: string;
  currentUserId: string;
  isAdmin: boolean;
  members: Member[];
  invitations: Invitation[];
};

export default function MembersPageClient({
  organizationId,
  organizationName,
  currentUserId,
  isAdmin,
  members: initialMembers,
  invitations: initialInvitations,
}: MembersPageClientProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [members, setMembers] = useState(initialMembers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [loading, setLoading] = useState<string | null>(null);

  const handleRemoveMember = async (userId: string) => {
    setLoading(userId);
    const result = await removeMember(organizationId, userId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Member removed");
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
    }
    setLoading(null);
  };

  const handleChangeRole = async (
    userId: string,
    newRole: "ADMIN" | "MANAGER",
  ) => {
    setLoading(userId);
    const result = await updateMemberRole(organizationId, userId, newRole);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Role updated");
      setMembers((prev) =>
        prev.map((m) => (m.user.id === userId ? { ...m, role: newRole } : m)),
      );
    }
    setLoading(null);
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    setLoading(invitationId);
    const result = await revokeInvitation(invitationId);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Invitation revoked");
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
    }
    setLoading(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Members</h2>
          <p className="text-muted-foreground">
            Manage who has access to {organizationName}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setInviteModalOpen(true)}>
            Invite Member
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members ({members.length})</CardTitle>
          <CardDescription>
            Current members of your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => {
                const isCurrentUser = member.user.id === currentUserId;
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.image || undefined} />
                          <AvatarFallback className="bg-gray-200 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                            {member.user.name?.[0]?.toUpperCase() ||
                              member.user.email?.[0]?.toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.user.name || "Unnamed User"}
                            {isCurrentUser && (
                              <Badge variant="outline" className="ml-2">
                                You
                              </Badge>
                            )}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {member.user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Badge
                          variant={
                            member.role === "ADMIN" ? "default" : "secondary"
                          }
                          className={`inline-flex items-center justify-center gap-1 px-2 py-1 ${
                            member.role === "ADMIN"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          {member.role === "ADMIN" ? (
                            <ShieldCheck className="h-3 w-3" />
                          ) : (
                            <Shield className="h-3 w-3" />
                          )}
                          <span className="text-xs">{member.role}</span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAdmin && !isCurrentUser && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={loading === member.user.id}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {member.role === "MANAGER" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(member.user.id, "ADMIN")
                                }
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(member.user.id, "MANAGER")
                                }
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make Manager
                              </DropdownMenuItem>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive cursor-pointer"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove Member
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Remove Member
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove this member
                                    from the organization? This action cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleRemoveMember(member.user.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
            <CardDescription>
              Invitations that haven&apos;t been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invited</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {invitation.email || "Shareable Link"}
                        </div>
                        {invitation.expiresAt && (
                          <div className="text-muted-foreground text-sm">
                            Expires{" "}
                            {new Date(
                              invitation.expiresAt,
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Badge
                          variant="outline"
                          className={`inline-flex items-center justify-center gap-1 px-2 py-1 ${
                            invitation.role === "ADMIN"
                              ? "border-primary bg-primary/10 text-primary dark:bg-primary/20"
                              : "border-gray-800 bg-gray-800 text-white dark:border-gray-200 dark:bg-gray-200 dark:text-gray-900"
                          }`}
                        >
                          {invitation.role === "ADMIN" ? (
                            <ShieldCheck className="h-3 w-3" />
                          ) : (
                            <Shield className="h-3 w-3" />
                          )}
                          <span className="text-xs">{invitation.role}</span>
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {invitation.invitedBy.name || invitation.invitedBy.email}
                    </TableCell>
                    <TableCell>
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={loading === invitation.id}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Revoke Invitation
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to revoke this invitation?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleRevokeInvitation(invitation.id)
                                }
                              >
                                Revoke
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <InviteMemberModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        organizationId={organizationId}
      />
    </div>
  );
}
