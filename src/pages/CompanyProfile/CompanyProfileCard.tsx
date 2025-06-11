import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Globe, Mail, Phone } from "lucide-react";
import { ICompanyProfile } from "./CompanyProfileProvider";

export default function CompanyProfileCard({
  company,
}: {
  company: ICompanyProfile | undefined;
}) {
  if (!company)
    return (
      <Card>
        <CardHeader>
          <CardTitle>How we'll display your company</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading...</div>
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>How we'll display your company</CardTitle>
        <div className="p-4">
          <Card className="p-4 gap-2 flex flex-col">
            <div className="flex items-center gap-3">
              <Avatar className="w-20 h-20">
                <AvatarImage src={company.avatar_url} />
                <AvatarFallback className="text-xl">
                  {company.company_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{company.company_name}</CardTitle>
            </div>
            <CardDescription>{company.description}</CardDescription>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <p>{company.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <p>{company.contact_email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <p>{company.address}</p>
                  </div>
                  {company.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <p>{company.website}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end h-full items-center">
                  <Button variant="outline" size="sm" disabled>
                    View Classes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardHeader>
    </Card>
  );
}
