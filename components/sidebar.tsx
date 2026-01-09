"use client";

import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Edit3,
  Filter,
  FormInput,
  Info,
  LayoutDashboard,
  List,
  Newspaper,
  Settings,
  TrendingUp,
  UploadIcon,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useSelectedLayoutSegments,
} from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import OrganizationSwitcher from "@/components/organization-switcher";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { getOrgAndAudienceList } from "@/lib/actions";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Nav({ children }: { children: React.ReactNode }) {
  const segments = useSelectedLayoutSegments();
  const { id } = useParams() as { id?: string };
  const pathname = usePathname();
  const { state } = useSidebar();

  const [siteId, setSiteId] = useState<string | null>(null);
  const [audienceListId, setAudienceListId] = useState<string | null>(null);
  const [organizationFound, setOrganizationFound] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [userOrgs, setUserOrgs] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const { data: emailData } = useSWR(
    id && pathname.includes("/email") ? `/api/email/${id}` : null,
    fetcher,
  );

  useEffect(() => {
    getOrgAndAudienceList().then((data) => {
      setSiteId(data?.orgId ?? null);
      setAudienceListId(data?.audienceListId ?? null);
      setOrganizationFound(!!data?.orgId);
      setUserOrgs(data?.userOrgs || []);
      setUserRole(data?.userRole ?? null);
      setLoading(false);
    });
  }, [id, pathname]);

  const navItems = useMemo(() => {
    if (loading) return [];

    // Email context
    if (segments[0] === "email" && id) {
      const isPublished = emailData?.published;
      return [
        {
          name: "Back to Dashboard",
          href: siteId ? `/organization/${siteId}` : "/organizations",
          icon: ArrowLeft,
        },
        isPublished && {
          name: "Details",
          href: `/email/${id}/`,
          isActive: segments.length === 2,
          icon: Info,
        },
        !isPublished && {
          name: "Editor",
          href: `/email/${id}/editor`,
          isActive: segments.includes("editor"),
          icon: Edit3,
        },
      ].filter(Boolean);
    }

    // Audience or Segments context
    if (
      segments[0] === "audience" ||
      segments[0] === "segments" ||
      pathname.includes("/segments")
    ) {
      return [
        {
          name: "Back to Dashboard",
          href: "/",
          icon: ArrowLeft,
        },
        {
          name: "People",
          icon: Users,
          submenu: [
            {
              name: "Contacts",
              href: `/audience/${audienceListId}`,
              isActive: segments[0] === "audience" && segments.length === 2,
              icon: List,
            },
            {
              name: "Add Contact",
              href: `/audience/${audienceListId}?action=add-contact`,
              icon: Edit3,
            },
            {
              name: "Import Contacts",
              href: `/audience/${audienceListId}?action=import`,
              icon: UploadIcon,
            },
            {
              name: "Custom Fields",
              href: `/audience/${audienceListId}?action=custom-fields`,
              icon: Settings,
            },
            {
              name: "Segments",
              href: `/organization/${siteId}/segments`,
              isActive: segments.includes("segments"),
              icon: Filter,
            },
          ],
        },
      ];
    }

    // Main org nav
    if (organizationFound) {
      return [
        {
          name: "Dashboard",
          href: "/",
          isActive: pathname === "/" || segments.length === 0,
          icon: LayoutDashboard,
        },
        {
          name: "People",
          href: `/audience/${audienceListId}`,
          isActive:
            pathname === `/audience/${audienceListId}` ||
            pathname === `/organization/${siteId}/audience` ||
            pathname === `/organization/${siteId}/audience/lists`,
          icon: Users,
        },
        {
          name: "Signup Forms",
          href: `/organization/${siteId}/signup-forms`,
          isActive: segments.includes("signup-forms"),
          icon: FormInput,
        },
        {
          name: "Emails",
          href: `/organization/${siteId}`,
          isActive: segments.length === 2,
          icon: Newspaper,
        },
        {
          name: "Reports",
          href: `/organization/${siteId}/analytics`,
          isActive: segments.includes("analytics"),
          icon: TrendingUp,
        },
        // Only show Settings for ADMIN users
        ...(userRole === "ADMIN"
          ? [
              {
                name: "Settings",
                icon: Settings,
                isActive: segments.includes("settings"),
                href: `/organization/${siteId}/settings`,
              },
            ]
          : []),
        {
          name: "Documentation",
          href: "/docs",
          isActive: pathname.includes("/docs"),
          icon: BookOpen,
        },
      ];
    }

    // Fallback nav
    return [
      {
        name: "Overview",
        href: "/",
        isActive: segments.length === 0,
        icon: LayoutDashboard,
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
        isActive:
          pathname === "/settings" || pathname.includes("/settings/appearance"),
      },
      {
        name: "Documentation",
        href: "/docs",
        isActive: pathname.includes("/docs"),
        icon: BookOpen,
      },
    ];
  }, [
    segments,
    id,
    siteId,
    audienceListId,
    organizationFound,
    loading,
    emailData,
    pathname,
    userRole,
  ]);

  return (
    <Sidebar
      collapsible="icon"
      className={`bg-sidebar text-sidebar-foreground h-full border-r ${state === "expanded" ? "p-4" : ""}`}
    >
      <SidebarHeader>
        <Link
          href="/"
          className={`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground inline-flex items-baseline gap-2 rounded-md transition-all duration-200 ${state === "expanded" ? "justify-start px-2 py-1.5" : "justify-center p-1.5"}`}
        >
          <div className="relative h-4 w-4">
            <Image
              src="/mailer.svg"
              width={16}
              height={16}
              alt="Mailer Logo"
              className="h-4 w-4"
            />
          </div>
          {state === "expanded" && (
            <div className="flex h-7 w-20 justify-start text-3xl leading-8 font-bold text-white">
              Mailer
            </div>
          )}
        </Link>
        {userOrgs.length > 0 && state === "expanded" && (
          <div className="px-2 py-2">
            <OrganizationSwitcher
              organizations={userOrgs}
              currentOrgId={siteId || undefined}
            />
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) =>
                item.submenu ? (
                  <Collapsible
                    key={item.name}
                    asChild
                    defaultOpen={true}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={item.name}
                          isActive={item.isActive}
                          className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground transition-colors"
                        >
                          <item.icon className="mr-2" size={18} />
                          <span>{item.name}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu.map((sub: any) => (
                            <SidebarMenuSubItem key={sub.name}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={sub.isActive}
                                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground transition-colors"
                              >
                                <Link
                                  href={sub.href}
                                  className="flex items-center"
                                >
                                  <sub.icon className="mr-2" size={16} />
                                  <span>{sub.name}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={item.name}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground transition-colors"
                    >
                      <Link
                        href={item.href}
                        className="flex items-center"
                        {...(item.name === "Documentation"
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        <item.icon className="mr-2" size={18} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {loading ? null : (
        <SidebarFooter>
          <div className="flex flex-col items-center justify-center gap-2">
            {state === "expanded" && (
              <Image
                src="/wtr.png"
                alt="With the Ranks"
                width={129}
                height={58}
                className="h-14 w-32"
              />
            )}
            {children}
          </div>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
