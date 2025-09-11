import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";

export default function PriceManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const updatePriceMutation = useMutation({
    mutationFn: async ({ productId, newPrice }: { productId: string; newPrice: number }) => {
      const response = await apiRequest("PUT", `/api/products/${productId}`, {
        currentPrice: newPrice.toString()
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Price updated",
        description: "Product price updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: () => {
      toast({
        title: "Price update failed",
        description: "Failed to update product price",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-card-foreground">Price Management</h3>
          <p className="text-muted-foreground">Manage product pricing and profit margins</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button data-testid="button-bulk-price-update">
            📊 Bulk Update
          </Button>
          <Button variant="outline" data-testid="button-price-history">
            📈 Price History
          </Button>
        </div>
      </div>

      {/* Market Prices Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Current Market Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.slice(0, 3).map((product: any, index: number) => {
              const colors = [
                { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', label: 'text-green-700', change: 'text-green-600' },
                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', label: 'text-blue-700', change: 'text-blue-600' },
                { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', label: 'text-purple-700', change: 'text-purple-600' }
              ];
              const color = colors[index % colors.length];
              
              return (
                <div key={product.id} className={`p-4 ${color.bg} rounded-lg border ${color.border}`}>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${color.text}`} data-testid={`market-${product.name.toLowerCase()}-price`}>
                      ₹{parseFloat(product.currentPrice || '0').toFixed(2)}
                    </div>
                    <div className={`text-sm ${color.label}`}>{product.name} - Current Rate</div>
                    <div className={`text-xs ${color.change} mt-1`}>→ Market rate</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Product Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Price Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-center p-3 font-medium">Category</th>
                  <th className="text-right p-3 font-medium">Cost Price</th>
                  <th className="text-right p-3 font-medium">Selling Price</th>
                  <th className="text-right p-3 font-medium">Margin</th>
                  <th className="text-center p-3 font-medium">Last Updated</th>
                  <th className="text-center p-3 font-medium">Status</th>
                  <th className="text-center p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? products.map((product: any, index: number) => {
                  const currentPrice = parseFloat(product.currentPrice || '0');
                  const estimatedCost = currentPrice * 0.95; // Estimated cost is 95% of selling price
                  const marginPercentage = ((currentPrice - estimatedCost) / estimatedCost * 100).toFixed(2);
                  
                  return (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3">
                        <div className="font-medium text-card-foreground" data-testid={`product-name-${index}`}>
                          {product.name}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" data-testid={`product-category-${index}`}>
                          {product.category}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-mono" data-testid={`cost-price-${index}`}>
                        ₹{estimatedCost.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <span className="font-semibold font-mono" data-testid={`selling-price-${index}`}>
                            ₹{currentPrice.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`font-semibold ${parseFloat(marginPercentage) > 5 ? 'text-green-600' : 
                                      parseFloat(marginPercentage) > 2 ? 'text-orange-600' : 'text-red-600'}`}
                              data-testid={`margin-${index}`}>
                          {marginPercentage}%
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm">
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={product.isActive ? 'default' : 'secondary'}
                          className={product.isActive ? 'bg-green-100 text-green-800' : ''}
                          data-testid={`product-status-${index}`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800"
                            data-testid={`button-edit-price-${index}`}
                          >
                            ✏️
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-800"
                            data-testid={`button-history-${index}`}
                          >
                            📈
                          </button>
                          <button 
                            className="text-purple-600 hover:text-purple-800"
                            data-testid={`button-schedule-${index}`}
                          >
                            ⏰
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Price Change Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Price Change Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">📈</span>
                <div>
                  <div className="text-sm font-medium text-green-800">Price Increase</div>
                  <div className="text-xs text-green-600">
                    Petrol price increased by ₹0.50 to ₹110.50 per liter effective from today
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <span className="text-red-500 mr-2">📉</span>
                <div>
                  <div className="text-sm font-medium text-red-800">Price Decrease</div>
                  <div className="text-xs text-red-600">
                    Diesel price decreased by ₹0.25 to ₹84.25 per liter effective from today
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <span className="text-yellow-500 mr-2">⚠️</span>
                <div>
                  <div className="text-sm font-medium text-yellow-800">Margin Alert</div>
                  <div className="text-xs text-yellow-600">
                    Diesel margin has dropped below 3%. Consider adjusting selling price.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
