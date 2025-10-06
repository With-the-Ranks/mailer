import { EyeIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Contact } from "@/lib/types";

interface ViewContactSheetProps {
  contact: Contact;
}

export function ViewContactSheet({ contact }: ViewContactSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm">
          <EyeIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] overflow-y-auto sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>
            {contact.firstName} {contact.lastName}
          </SheetTitle>
          <SheetDescription>Contact details and information</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 py-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  First Name
                </Label>
                <p className="text-sm">{contact.firstName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Last Name
                </Label>
                <p className="text-sm">{contact.lastName}</p>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-sm font-medium">
                Email
              </Label>
              <p className="text-sm text-blue-600">{contact.email}</p>
            </div>
            {contact.phone && (
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Phone
                </Label>
                <p className="text-sm">{contact.phone}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Address Information */}
          {(contact.defaultAddressCompany ||
            contact.defaultAddressAddress1 ||
            contact.defaultAddressCity ||
            contact.defaultAddressCountryCode) && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address Information</h3>
                {contact.defaultAddressCompany && (
                  <div>
                    <Label className="text-muted-foreground text-sm font-medium">
                      Organization
                    </Label>
                    <p className="text-sm">{contact.defaultAddressCompany}</p>
                  </div>
                )}
                {contact.defaultAddressAddress1 && (
                  <div>
                    <Label className="text-muted-foreground text-sm font-medium">
                      Address
                    </Label>
                    <p className="text-sm">
                      {contact.defaultAddressAddress1}
                      {contact.defaultAddressAddress2 && <br />}
                      {contact.defaultAddressAddress2}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {contact.defaultAddressCity && (
                    <div>
                      <Label className="text-muted-foreground text-sm font-medium">
                        City
                      </Label>
                      <p className="text-sm">{contact.defaultAddressCity}</p>
                    </div>
                  )}
                  {contact.defaultAddressZip && (
                    <div>
                      <Label className="text-muted-foreground text-sm font-medium">
                        Zip Code
                      </Label>
                      <p className="text-sm">{contact.defaultAddressZip}</p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {contact.defaultAddressProvinceCode && (
                    <div>
                      <Label className="text-muted-foreground text-sm font-medium">
                        State/Province
                      </Label>
                      <Badge variant="outline" className="font-mono">
                        {contact.defaultAddressProvinceCode}
                      </Badge>
                    </div>
                  )}
                  {contact.defaultAddressCountryCode && (
                    <div>
                      <Label className="text-muted-foreground text-sm font-medium">
                        Country
                      </Label>
                      <Badge variant="outline" className="font-mono">
                        {contact.defaultAddressCountryCode}
                      </Badge>
                    </div>
                  )}
                </div>
                {contact.defaultAddressPhone && (
                  <div>
                    <Label className="text-muted-foreground text-sm font-medium">
                      Address Phone
                    </Label>
                    <p className="text-sm">{contact.defaultAddressPhone}</p>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Tags and Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Information</h3>
            {contact.tags && (
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Tags
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {contact.tags.split(",").map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {contact.note && (
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Note
                </Label>
                <p className="bg-muted mt-1 rounded-md p-3 text-sm">
                  {contact.note}
                </p>
              </div>
            )}
          </div>

          {/* Custom Fields */}
          {contact.customFields &&
            Object.keys(contact.customFields).length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Custom Fields</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(contact.customFields).map(
                      ([key, value]) => (
                        <div key={key}>
                          <Label className="text-muted-foreground text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </Label>
                          <p className="text-sm">{value}</p>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </>
            )}

          {/* Subscription Status */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Subscription Status</h3>
            <div>
              <Label className="text-muted-foreground text-sm font-medium">
                Status
              </Label>
              <div className="mt-2">
                {contact.isUnsubscribed ? (
                  <Badge
                    variant="outline"
                    className="border-red-200 bg-red-50 text-red-700"
                  >
                    Unsubscribed
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    Subscribed
                  </Badge>
                )}
              </div>
            </div>
            {contact.isUnsubscribed && contact.unsubscribedAt && (
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Unsubscribed On
                </Label>
                <p className="text-sm">
                  {new Date(contact.unsubscribedAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {contact.isUnsubscribed && contact.unsubscribeReason && (
              <div>
                <Label className="text-muted-foreground text-sm font-medium">
                  Reason
                </Label>
                <p className="text-sm">{contact.unsubscribeReason}</p>
              </div>
            )}
          </div>

          {/* Metadata */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Metadata</h3>
            <div className="grid grid-cols-2 gap-4">
              {contact.createdAt && (
                <div>
                  <Label className="text-muted-foreground text-sm font-medium">
                    Created
                  </Label>
                  <p className="text-sm">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {contact.updatedAt && (
                <div>
                  <Label className="text-muted-foreground text-sm font-medium">
                    Last Updated
                  </Label>
                  <p className="text-sm">
                    {new Date(contact.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
