import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo } from 'react-native-purchases';
import { useQuery, useMutation } from '@tanstack/react-query';

const getRCToken = () => {
  if (__DEV__ || Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
  }
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  });
};

const configureRevenueCat = async () => {
  const apiKey = getRCToken();
  if (!apiKey) {
    console.warn('RevenueCat API key not configured');
    return false;
  }

  try {
    await Purchases.configure({ apiKey });
    console.log('RevenueCat configured successfully');
    return true;
  } catch (error) {
    console.error('Failed to configure RevenueCat:', error);
    return false;
  }
};

configureRevenueCat();

export const [SubscriptionProvider, useSubscription] = createContextHook(() => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const customerInfoQuery = useQuery({
    queryKey: ['customerInfo'],
    queryFn: async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        return info;
      } catch (error) {
        console.error('Error fetching customer info:', error);
        return null;
      }
    },
    refetchInterval: 60000,
  });

  const offeringsQuery = useQuery({
    queryKey: ['offerings'],
    queryFn: async () => {
      try {
        const offerings = await Purchases.getOfferings();
        return offerings;
      } catch (error) {
        console.error('Error fetching offerings:', error);
        return null;
      }
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: any) => {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    },
    onSuccess: (customerInfo) => {
      customerInfoQuery.refetch();
      checkPremiumStatus(customerInfo);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      const customerInfo = await Purchases.restorePurchases();
      return customerInfo;
    },
    onSuccess: (customerInfo) => {
      customerInfoQuery.refetch();
      checkPremiumStatus(customerInfo);
    },
  });

  const checkPremiumStatus = (info: CustomerInfo | null) => {
    if (!info) {
      setIsPremium(false);
      return;
    }
    const hasPremium = info.entitlements.active['premium'] !== undefined;
    setIsPremium(hasPremium);
  };

  useEffect(() => {
    if (customerInfoQuery.data) {
      checkPremiumStatus(customerInfoQuery.data);
      setIsLoading(false);
    } else if (!customerInfoQuery.isLoading) {
      setIsLoading(false);
    }
  }, [customerInfoQuery.data, customerInfoQuery.isLoading]);

  const purchasePackage = async (pkg: any) => {
    try {
      await purchaseMutation.mutateAsync(pkg);
      return true;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('User cancelled purchase');
      } else {
        console.error('Purchase error:', error);
      }
      return false;
    }
  };

  const restorePurchases = async () => {
    try {
      await restoreMutation.mutateAsync();
      return true;
    } catch (error) {
      console.error('Restore error:', error);
      return false;
    }
  };

  return {
    isPremium,
    isLoading,
    offerings: offeringsQuery.data?.current,
    purchasePackage,
    restorePurchases,
    isRestoring: restoreMutation.isPending,
    isPurchasing: purchaseMutation.isPending,
  };
});
