
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Clock, Users, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PackageData {
  id: string;
  name: string;
  description: string;
  package_type: 'class_count' | 'time_based';
  class_count: number | null;
  duration_days: number | null;
  price_cents: number;
  companies: {
    id: string;
    company_name: string;
  };
}

interface PackagePurchaseProps {
  companyId?: string;
}

const PackagePurchase = ({ companyId }: PackagePurchaseProps) => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, [companyId]);

  const fetchPackages = async () => {
    try {
      let query = supabase
        .from('packages')
        .select(`
          *,
          companies (
            id,
            company_name
          )
        `)
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPackages((data || []).map(pkg => ({
        ...pkg,
        package_type: pkg.package_type as 'class_count' | 'time_based'
      })));
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to load packages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchasePackage = async (packageId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase packages.",
        variant: "destructive",
      });
      return;
    }

    setPurchasing(packageId);

    try {
      const { data, error } = await supabase.functions.invoke('create-package-checkout', {
        body: { packageId },
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session.",
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  if (loading) {
    return <div className="text-center py-4">Loading packages...</div>;
  }

  return (
    <div>
      {!companyId && (
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Available Class Packages</h3>
          <p className="text-gray-600">Purchase class packages and save on your favorite fitness classes</p>
        </div>
      )}

      {packages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages available</h3>
            <p className="text-gray-600">Check back soon for new class packages!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((packageItem) => (
            <Card key={packageItem.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{packageItem.name}</CardTitle>
                    <CardDescription>
                      {packageItem.companies.company_name}
                    </CardDescription>
                    {packageItem.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {packageItem.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {packageItem.package_type.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {packageItem.package_type === 'class_count' && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {packageItem.class_count} classes included
                      </span>
                    </div>
                  )}
                  {packageItem.package_type === 'time_based' && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        {packageItem.duration_days} days unlimited access
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ${formatPrice(packageItem.price_cents)}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handlePurchasePackage(packageItem.id)}
                  disabled={purchasing === packageItem.id}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {purchasing === packageItem.id ? 'Creating Checkout...' : 'Purchase Package'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PackagePurchase;
