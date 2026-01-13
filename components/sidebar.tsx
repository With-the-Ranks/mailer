"use client";

import {
  BadgePlus,
  ChartLine,
  ChevronRight,
  CornerDownRight,
  Edit3,
  FileQuestion,
  Filter,
  Form,
  Info,
  LayoutDashboard,
  List,
  Newspaper,
  Settings,
  TableProperties,
} from "lucide-react";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useSelectedLayoutSegments,
} from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import Logo from "@/components/logo";
import LogoutButton from "@/components/logout-button";
import OrganizationSwitcher from "@/components/organization-switcher";
import ThemeSwitcher from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
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

    // Main org nav - always show these core items
    if (organizationFound) {
      const isOnEmailPage = segments[0] === "email" && id;
      const isOnAudiencePage = segments[0] === "audience";
      const isOnSegmentsPage = segments.includes("segments");
      const isPublished = emailData?.published;
      const isOnEmailsListPage =
        segments[0] === "organization" && segments.length === 2;

      return [
        {
          name: "Dashboard",
          href: "/",
          isActive: pathname === "/" || segments.length === 0,
          icon: LayoutDashboard,
        },
        {
          name: "People",
          href: audienceListId
            ? `/audience/${audienceListId}`
            : `/organization/${siteId}/audience`,
          isActive: false, // Parent never gets highlighted when submenu is showing
          icon: TableProperties,
          submenu:
            isOnAudiencePage || isOnSegmentsPage
              ? [
                  {
                    name: "Contacts",
                    href: audienceListId
                      ? `/audience/${audienceListId}`
                      : `/organization/${siteId}/audience`,
                    isActive:
                      segments[0] === "audience" && segments.length === 2,
                    icon: List,
                  },
                  {
                    name: "Segments",
                    href: `/organization/${siteId}/segments`,
                    isActive: segments.includes("segments"),
                    icon: Filter,
                  },
                ]
              : undefined,
        },
        {
          name: "Signup Forms",
          href: `/organization/${siteId}/signup-forms`,
          isActive: segments.includes("signup-forms"),
          icon: Form,
        },
        {
          name: "Emails",
          href: `/organization/${siteId}`,
          isActive: isOnEmailsListPage && !isOnEmailPage, // Only highlight when on emails list, not on individual email
          icon: Newspaper,
          submenu: isOnEmailPage
            ? [
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
              ].filter(Boolean)
            : isOnEmailsListPage
              ? [
                  {
                    name: "Create Email",
                    href: "?action=create-email",
                    isActive: false,
                    icon: CornerDownRight,
                  },
                ]
              : undefined,
        },
        {
          name: "Reports",
          href: `/organization/${siteId}/analytics`,
          isActive: segments.includes("analytics"),
          icon: ChartLine,
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
          name: "Support",
          href: "/docs",
          isActive: pathname.includes("/docs"),
          icon: FileQuestion,
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
        icon: FileQuestion,
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
      className={`h-full border-r border-neutral-300 bg-white text-black dark:border-neutral-700 dark:bg-[#2D2D2D] dark:text-white ${state === "expanded" ? "p-8" : ""}`}
    >
      <SidebarHeader className={`mb-4 ${state === "expanded" ? "p-0" : "p-2"}`}>
        <Logo />
        {userOrgs.length > 0 && state === "expanded" && (
          <div className="mt-4">
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
            <SidebarMenu className="gap-2">
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
                          isActive={!!item.isActive}
                          className="rounded-lg py-2 pr-4 pl-2 text-sm font-normal text-black transition-all hover:bg-neutral-100 hover:font-bold hover:text-black focus-visible:ring-neutral-300 data-[active=true]:bg-neutral-100 data-[active=true]:font-bold data-[active=true]:text-black dark:text-white dark:hover:bg-neutral-800 dark:hover:text-white dark:data-[active=true]:bg-neutral-800 dark:data-[active=true]:text-white hover:[&>svg]:text-black data-[active=true]:[&>svg]:text-black dark:hover:[&>svg]:text-white dark:data-[active=true]:[&>svg]:text-white"
                        >
                          <item.icon
                            className="mr-1.5 text-black dark:text-white"
                            size={24}
                          />
                          <span className="whitespace-nowrap">{item.name}</span>
                          <ChevronRight className="ml-auto text-black transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 dark:text-white" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu.map((sub: any) => (
                            <SidebarMenuSubItem key={sub.name}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={sub.isActive}
                                className="rounded-lg py-1.5 pr-4 pl-2 text-sm font-normal text-black transition-all hover:bg-neutral-100 hover:font-bold hover:text-black focus-visible:ring-neutral-300 data-[active=true]:bg-neutral-100 data-[active=true]:font-bold data-[active=true]:text-black dark:text-white dark:hover:bg-neutral-800 dark:hover:text-white dark:data-[active=true]:bg-neutral-800 dark:data-[active=true]:text-white [&>svg]:text-black hover:[&>svg]:text-black data-[active=true]:[&>svg]:text-black dark:[&>svg]:text-white dark:hover:[&>svg]:text-white dark:data-[active=true]:[&>svg]:text-white"
                              >
                                <Link
                                  href={sub.href}
                                  className="flex items-center gap-1"
                                >
                                  <sub.icon
                                    className="mr-0 text-black dark:text-white"
                                    size={16}
                                  />
                                  <span className="whitespace-nowrap">
                                    {sub.name}
                                  </span>
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
                      isActive={!!item.isActive}
                      tooltip={item.name}
                      className="rounded-lg py-2 pr-4 pl-2 text-sm font-normal text-black transition-all hover:bg-neutral-100 hover:font-bold hover:text-black focus-visible:ring-neutral-300 data-[active=true]:bg-neutral-100 data-[active=true]:font-bold data-[active=true]:text-black dark:text-white dark:hover:bg-neutral-800 dark:hover:text-white dark:data-[active=true]:bg-neutral-800 dark:data-[active=true]:text-white"
                    >
                      <Link
                        href={item.href}
                        className="flex items-center"
                        {...(item.name === "Support"
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        <item.icon
                          className="mr-1.5 text-black dark:text-white"
                          size={24}
                        />
                        <span className="whitespace-nowrap">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {organizationFound && state === "expanded" && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-0">
                <Link href="?action=create-email" scroll={false}>
                  <Button
                    className="w-full items-center justify-center gap-1 rounded-lg bg-linear-to-bl from-amber-200 to-amber-400 p-2 text-sm font-bold text-black transition-colors hover:from-amber-300 hover:to-amber-500"
                    size="default"
                  >
                    <BadgePlus className="h-6 w-6" />
                    Create
                  </Button>
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      {loading ? null : (
        <SidebarFooter className="p-0">
          <div className="flex w-full flex-col gap-2">
            {children}
            {state === "expanded" && (
              <div className="flex w-full items-center justify-between">
                <ThemeSwitcher />
                <LogoutButton />
              </div>
            )}
          </div>
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
